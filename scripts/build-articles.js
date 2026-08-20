#!/usr/bin/env node
/* eslint-env node */
/**
 * build-articles.js — Notion → web.staircrusher.club/articles 정적 생성기 (결정론적, incremental)
 *
 * 의존성: Notion REST API는 node 20 내장 fetch로 직접 호출한다. 유일한 외부 패키지는 목록 썸네일
 * 생성용 `sharp`(devDependency)이고, 이것도 실제로 만들 게 있을 때만 lazy require 한다 —
 * 썸네일이 전부 최신이면 sharp 없이도 이 스크립트는 끝까지 돈다.
 *
 * - article-list DB를 쿼리. 각 row는 두 형태를 모두 지원:
 *     (1) row 제목이 다른 페이지 mention → 그 타깃 페이지가 본문 (link 형태)
 *     (2) row 자체에 본문 블록 → row가 곧 article
 * - incremental: **본문이 있는 페이지의 last_edited_time**을 manifest와 대조해 변경분만 처리.
 *   (메타 라이트백은 row를 건드리므로 mention 형태에선 시계 함정이 자연 회피됨)
 * - 본문(블록)→시맨틱 HTML 변환은 결정론적(LLM 토큰 0). callout/toggle/column/색상 보존.
 * - 메타데이터(slug/summary/ogImage/category/faq)는 생성하지 않고 **DB row 프로퍼티에서 읽기만** 한다.
 *   (메타는 /scc-web-articles-publish 스킬에서 Claude가 생성해 row에 라이트백 해둠)
 *
 * 사용: NOTION_TOKEN=secret node scripts/build-articles.js --db <database_id> [--dry]
 */

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {execFileSync} = require('child_process');
const {
  SITE,
  CATEGORIES,
  renderArticlePage,
  renderListPage,
} = require('./article-template');

const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'web-articles');
const DIST_DIR = path.join(ROOT, 'web-dist');
const DIST_ARTICLES = path.join(DIST_DIR, 'articles');
const MANIFEST_PATH = path.join(SRC_DIR, 'manifest.json');
const SUBPAGES_PATH = path.join(SRC_DIR, 'subpages.json');

// 카드형 인라인 DB row → 상세 페이지 메타(rowId → {parentSlug, slug, summary, title}).
// /scc-web-articles-publish STEP 2b에서 LLM으로 생성해 커밋. 렌더 시 상세 페이지 발행에 사용.
let SUBPAGES = {};
// Notion 내부 page-id(하이픈 제거, 소문자) → 우리 사이트 URL. 본문 내 내부 링크 remap용.
let LINK_MAP = {};
// 발행 경로(/articles/...) → {title, desc, image}. bookmark 블록을 Notion처럼 카드로 렌더하는 용도.
let CARD_BY_PATH = {};
const noHy = s => (s || '').replace(/-/g, '').toLowerCase();

// ---------- CLI / env ----------
function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
const DB_ID = arg('db') || process.env.ARTICLES_DB_ID;
const TOKEN = process.env.NOTION_TOKEN;
const DRY = process.argv.includes('--dry');
const FORCE = process.argv.includes('--force'); // 템플릿/스타일 변경 시 전체 재생성
// --only a,b,c : 지정 slug만 강제 재생성(단계적 롤아웃용). 나머지는 커밋된 HTML 그대로.
// 렌더러를 바꿨는데 전체를 한 번에 갈아엎고 싶지 않을 때 쓴다.
const ONLY = (arg('only') || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
// offline: Notion 미사용. 레포에 커밋된 web-articles/(소스+manifest)로 web-dist만 재조립.
// → yarn web:build가 이걸 돌려, 앱 웹 배포 시에도 web-dist에 /articles가 항상 포함된다
//   (web-deploy.sh의 `sync --delete`가 /articles를 지우지 않게 하는 구조적 안전장치).
const OFFLINE = process.argv.includes('--offline');
// rerender: 템플릿을 다시 타지만 렌더 입력은 디스크 캐시에서만 읽는다(Notion 무접속).
// 상세 근거는 아래 "렌더 입력 디스크 캐시" 블록 참조.
const RERENDER = process.argv.includes('--rerender');
// --offline 은 article-template.js 를 호출하지 않고 커밋된 HTML 을 복사만 한다.
// 따라서 --force/--only(= "템플릿 바꿨으니 다시 렌더해라") 와 조합하면 의미가 상충하고,
// 성공 로그만 보고 "반영됐다"고 착각하게 된다. 조합 자체를 거부한다.
// (2026-08-07: `--offline --force` 로 빌드하고 CTA 템플릿 변경이 반영된 줄 알았다)
if (OFFLINE && (FORCE || ONLY.length) && require.main === module) {
  console.error(
    '❌ --offline 은 템플릿을 다시 타지 않습니다(커밋된 HTML 복사만) — ' +
      `--${FORCE ? 'force' : 'only'} 와 함께 쓸 수 없습니다.\n` +
      '   템플릿/CSS/인라인JS 를 고쳤다면 NOTION_TOKEN 을 주고 --offline 없이 실행하세요.',
  );
  process.exit(1);
}
// --rerender 는 --offline 과 달리 템플릿을 다시 탄다(= 템플릿 수정 반영됨). 대신 렌더 입력을
// 디스크 캐시에서만 읽어 Notion 을 안 탄다. 둘을 같이 주면 어느 쪽이 이기는지 불분명하다.
if (OFFLINE && RERENDER && require.main === module) {
  console.error(
    '❌ --offline 과 --rerender 는 함께 쓸 수 없습니다.\n' +
      '   --offline = 커밋된 HTML 복사만(템플릿 안 탐) / --rerender = 캐시로 템플릿만 재적용.',
  );
  process.exit(1);
}
// require.main 가드: 테스트에서 require 할 때 인자 검증으로 process.exit 하면 안 된다.
if (!OFFLINE && require.main === module) {
  // --rerender 는 네트워크를 안 타므로 토큰이 필요 없다(--db 는 캐시 키를 만들 때 쓴다).
  if (!TOKEN && !RERENDER) {
    console.error(
      '❌ NOTION_TOKEN 환경변수가 필요합니다. (배포용 재조립만이면 --offline, 템플릿만 다시 찍으려면 --rerender)',
    );
    process.exit(1);
  }
  if (!DB_ID) {
    console.error(
      '❌ --db <database_id> 또는 ARTICLES_DB_ID 가 필요합니다. (또는 --offline)',
    );
    process.exit(1);
  }
}

// ---------- Notion REST ----------
const H = {
  Authorization: `Bearer ${TOKEN}`,
  'Notion-Version': '2022-06-28',
  'Content-Type': 'application/json',
};
// fetch에 타임아웃+재시도(무타임아웃 fetch가 stalled 연결에서 무한 hang → 빌드 정지 방지)
async function fetchWithTimeout(url, opts = {}, ms = 25000, tries = 3) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), ms);
    try {
      return await fetch(url, {...opts, signal: ac.signal});
    } catch (e) {
      lastErr = e;
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastErr;
}
// ---------- 렌더 입력 디스크 캐시 (--rerender 용) ----------
// 왜: 템플릿/CSS/인라인JS 만 고쳐도 예전엔 --force 로 전 페이지 블록을 Notion 에서 다시
// 받아야 했다(42페이지 20분+, 그동안 외부 OG/썸네일 transient 실패에 그대로 노출).
// 렌더 입력(공식 API 응답·v3 레이아웃·북마크 OG)을 디스크에 남겨두면 Notion 무접속으로
// 템플릿만 다시 찍을 수 있다. 캐시 경계를 네트워크 진입점 4곳에 두므로 렌더 코드는 그대로다.
//
// 캐시는 **gitignore** 다(2026-08-20 결정) — 레포 용량을 안 쓰는 대신, 새 클론에서는
// --rerender 전에 --force 가 1회 선행돼야 한다. 캐시가 없으면 조용히 낡은 결과를 내지 않고
// 그 slug 를 건너뛰고 --force 를 안내한다(--offline 착각 사고 2026-08-07 의 재발 방지).
const CACHE_DIR = path.join(__dirname, '..', '.articles-cache');
const CACHE_V = 1; // 렌더 입력 구조가 바뀌면 올려 캐시를 자동 무효화한다
const cacheMisses = [];

function cacheFile(kind, key) {
  const h = crypto.createHash('sha1').update(key).digest('hex');
  return path.join(CACHE_DIR, `${kind}-${h}.json`);
}
function cacheRead(kind, key) {
  const f = cacheFile(kind, key);
  if (!fs.existsSync(f)) return undefined;
  try {
    const j = JSON.parse(fs.readFileSync(f, 'utf8'));
    return j.v === CACHE_V ? j.data : undefined;
  } catch {
    return undefined; // 깨진 캐시는 미스로 취급한다
  }
}
function cacheWrite(kind, key, data) {
  try {
    fs.mkdirSync(CACHE_DIR, {recursive: true});
    fs.writeFileSync(cacheFile(kind, key), JSON.stringify({v: CACHE_V, data}));
  } catch (e) {
    // 캐시 실패로 빌드를 죽이지 않는다 — 다음 --rerender 가 미스로 잡아 --force 를 안내한다
    console.warn(`  ⚠️ 캐시 기록 실패(${kind}): ${e.message}`);
  }
}
// --rerender 에서 캐시에 없는 입력을 만났을 때.
// 렌더 도중에 터지면 prepareArticleDir 이 이미 index.html 을 지운 상태라 그 페이지가 빈 채로
// 남는다. 그래서 아래 hasRenderCache 로 **디렉토리를 건드리기 전에** 걸러내고, 그래도 새는
// 경우(중첩 블록·자식 DB row)는 여기서 치명 처리해 조용한 반쪽 산출물을 만들지 않는다.
// 복구는 같은 --force 를 끝까지 다시 돌리면 된다(멱등).
function cacheMiss(kind, key) {
  const e = new Error(
    `--rerender: 캐시에 없는 입력 (${kind}: ${key.slice(0, 80)})\n` +
      `   이 slug 는 캐시가 불완전합니다 — NOTION_TOKEN 을 주고 --force 로 다시 받으세요.`,
  );
  e.__cacheMiss = {kind, key};
  throw e;
}
// 사전 점검: 이 페이지의 **최상위** 렌더 입력 2개가 캐시에 있는지. fetchChildren 이 재귀로
// 전체 트리를 한 번에 받아 캐시하므로, 이 둘이 있으면 본문 블록은 통째로 있다.
function hasRenderCache(contentPageId) {
  const childrenKey = `GET blocks/${contentPageId}/children?page_size=100 `;
  return (
    cacheRead('api', childrenKey) !== undefined &&
    cacheRead('layout', contentPageId) !== undefined
  );
}

async function api(method, p, body) {
  const isRead = method === 'GET' || /\/query$/.test(p);
  const key = `${method} ${p} ${body ? JSON.stringify(body) : ''}`;
  if (RERENDER) {
    // 쓰기(publishedAt 스탬프)는 재렌더에서 하지 않는다 — Notion 을 건드리지 않는 모드다
    if (!isRead) return {};
    const hit = cacheRead('api', key);
    if (hit === undefined) cacheMiss('api', key);
    return hit;
  }
  const res = await fetchWithTimeout(`https://api.notion.com/v1/${p}`, {
    method,
    headers: H,
    body: body ? JSON.stringify(body) : undefined,
  });
  // 429 rate-limit → Retry-After 후 1회 재시도
  if (res.status === 429) {
    const wait = (Number(res.headers.get('retry-after')) || 2) * 1000;
    await new Promise(r => setTimeout(r, wait));
    return api(method, p, body);
  }
  const j = await res.json();
  if (j && j.object === 'error')
    throw new Error(`Notion ${j.code}: ${j.message}`);
  if (isRead) cacheWrite('api', key, j);
  return j;
}
async function queryDb(dbId) {
  const out = [];
  let cursor;
  do {
    const j = await api(
      'POST',
      `databases/${dbId}/query`,
      cursor ? {start_cursor: cursor} : {},
    );
    out.push(...j.results);
    cursor = j.has_more ? j.next_cursor : undefined;
  } while (cursor);
  return out;
}
const queryAllPages = () => queryDb(DB_ID);
async function retrievePage(id) {
  return api('GET', `pages/${id}`);
}
async function fetchChildren(blockId) {
  const out = [];
  let cursor;
  do {
    const qs = `?page_size=100${cursor ? `&start_cursor=${cursor}` : ''}`;
    const j = await api('GET', `blocks/${blockId}/children${qs}`);
    out.push(...j.results);
    cursor = j.has_more ? j.next_cursor : undefined;
  } while (cursor);
  for (const b of out) {
    if (b.has_children) b.__children = await fetchChildren(b.id);
  }
  return out;
}
// 이미지 표시 폭/정렬 + 인라인 DB 컬럼 폭/순서는 공식 API가 안 준다 → Notion 비공식 v3
// loadPageChunk에서 가져온다. (공개 페이지는 무인증 200. Oopy 등이 쓰는 그 데이터.)
// 반환: { img: {blockId → {w,ar,align,full}}, db: {dbBlockId → [{name,width}]}(뷰 순서) }
const v3val = r => r && r.value && (r.value.value || r.value);
async function fetchPageLayout(pageId) {
  if (RERENDER) {
    const hit = cacheRead('layout', pageId);
    if (hit === undefined) cacheMiss('layout', pageId);
    return hit;
  }
  const out = await fetchPageLayoutUncached(pageId);
  cacheWrite('layout', pageId, out);
  return out;
}
async function fetchPageLayoutUncached(pageId) {
  const img = {};
  const db = {};
  try {
    const blockMap = {};
    const cvMap = {};
    const colMap = {};
    let cursor = {stack: []};
    for (let guard = 0; guard < 30; guard++) {
      const res = await fetchWithTimeout(
        'https://www.notion.so/api/v3/loadPageChunk',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0',
          },
          body: JSON.stringify({
            pageId,
            limit: 100,
            chunkNumber: guard,
            cursor,
            verticalColumns: false,
          }),
        },
        20000,
        2,
      );
      if (!res.ok) break;
      const j = await res.json();
      Object.assign(blockMap, (j.recordMap && j.recordMap.block) || {});
      Object.assign(cvMap, (j.recordMap && j.recordMap.collection_view) || {});
      Object.assign(colMap, (j.recordMap && j.recordMap.collection) || {});
      cursor =
        j.cursor && j.cursor.stack && j.cursor.stack.length ? j.cursor : null;
      if (!cursor) break;
    }
    for (const id in blockMap) {
      const v = v3val(blockMap[id]);
      if (!v) continue;
      if (v.type === 'image' && v.format)
        img[id] = {
          w: v.format.block_width,
          ar: v.format.block_aspect_ratio,
          align: v.format.block_alignment,
          full: v.format.block_full_width,
        };
      // 인라인 DB(collection_view): 뷰의 table_properties = 컬럼 순서 + 폭(px)
      if (
        (v.type === 'collection_view' || v.type === 'collection_view_page') &&
        v.collection_id &&
        v.view_ids &&
        v.view_ids.length
      ) {
        const schema = (v3val(colMap[v.collection_id]) || {}).schema || {};
        const view = v3val(cvMap[v.view_ids[0]]);
        const tp = view && view.format && view.format.table_properties;
        if (tp) {
          const cols = tp
            .filter(p => p.visible !== false)
            .map(p => ({
              name: schema[p.property] && schema[p.property].name,
              width: p.width,
            }))
            .filter(c => c.name);
          if (cols.length) db[id] = cols;
        }
      }
    }
  } catch (e) {
    console.warn(`  ⚠️ 레이아웃(v3) 조회 실패(${pageId}): ${e.message}`);
  }
  return {img, db};
}

// ---------- utils ----------
const readJson = (p, f) => {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return f;
  }
};
const readFileOr = (p, f) => {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch {
    return f;
  }
};
const rmrf = p => fs.rmSync(p, {recursive: true, force: true});
function copyDir(src, dst) {
  fs.mkdirSync(dst, {recursive: true});
  for (const e of fs.readdirSync(src, {withFileTypes: true})) {
    const s = path.join(src, e.name);
    const d = path.join(dst, e.name);
    e.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}
const plain = rich => (rich || []).map(r => r.plain_text).join('');

// ---------- escape (template과 동일 규칙) ----------
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ---------- row → 메타/본문소스 해석 ----------
function titleRichOf(page) {
  const props = page.properties || {};
  for (const k of Object.keys(props))
    if (props[k].type === 'title') return props[k].title;
  return [];
}
// 제목에 [WIP]가 있으면 작성 중 → 발행 대상에서 통째로 제외한다(대소문자 무시).
// 이미 발행된 글에 [WIP]를 붙이면 삭제 판정에 걸려 prod에서 내려간다(= 발행 취소).
const isWip = title => /\[\s*wip\s*\]/i.test(title || '');

function resolveRow(page) {
  const props = page.properties || {};
  const titleRich = titleRichOf(page);
  const title = plain(titleRich).trim();
  const mention = (titleRich || []).find(
    t => t.type === 'mention' && t.mention.type === 'page',
  );
  const contentPageId = mention ? mention.mention.page.id : page.id;

  const readText = name => {
    const p = props[name];
    if (!p) return '';
    if (p.type === 'rich_text') return plain(p.rich_text);
    if (p.type === 'url') return p.url || '';
    return '';
  };
  const slug = readText('slug');
  const summary = readText('summary');
  // 상세 하단 고정 CTA 바의 목적지/문구. **비어 있는 게 정상값**이고 템플릿이 콘텐츠 홈으로
  // 폴백한다(article-template의 CTA 참조). 채우는 3버킷 규칙은 /scc-web-articles-publish STEP 2.
  const ctaUrl = readText('ctaUrl');
  const ctaLabel = readText('ctaLabel');
  let ogImage = '';
  const og = props.ogImage;
  if (og) {
    if (og.type === 'url') ogImage = og.url || '';
    else if (og.type === 'files' && og.files[0])
      ogImage = og.files[0].file?.url || og.files[0].external?.url || '';
    else if (og.type === 'rich_text') ogImage = plain(og.rich_text);
  }
  // tags 는 더 이상 읽지 않는다 — 상세 하단 태그 칩이 제거되면서 렌더 소비처가 없어졌다.
  // Notion 컬럼과 기존 값은 그대로 두므로 나중에 다시 쓰려면 여기서 읽어오면 된다.
  // category(multi_select): 목록 페이지 카테고리 필터의 유일한 근거. 최소 1개 필수
  // (없으면 needsMeta로 빠져 발행되지 않는다). 허용값은 article-template의 CATEGORIES.
  const categories =
    props.category && props.category.type === 'multi_select'
      ? props.category.multi_select.map(t => t.name)
      : [];
  // featured(number): 값이 있으면 목록 맨 위로, 1·2·3… 오름차순. 비어 있으면 일반 글.
  const featured =
    props.featured && props.featured.type === 'number'
      ? props.featured.number
      : null;
  // publishedAt(date): 최초 발행 시각의 source of truth. 비어 있으면 아직 미발행 →
  // 빌드가 지금 시각을 찍고 DB에 써넣는다(stampPublishedAt).
  const publishedAt =
    props.publishedAt &&
    props.publishedAt.type === 'date' &&
    props.publishedAt.date &&
    props.publishedAt.date.start
      ? new Date(props.publishedAt.date.start).toISOString()
      : '';
  let faq = [];
  if (props.faq && props.faq.type === 'rich_text') {
    try {
      // ponytail: strip leading whitespace/zero-width/BOM before parse. Notion MCP
      // auto-parses (then rejects) any rich_text value that is a bare JSON array,
      // so faq writers prefix a zero-width space (or plain space) to keep it a
      // string. Build is the single robust parse point. (/scc-web-articles-publish STEP 2)
      faq =
        JSON.parse(plain(props.faq.rich_text).replace(/^[\s﻿​]+/, '')) || [];
    } catch {
      faq = [];
    }
  }
  return {
    rowId: page.id,
    contentPageId,
    isMention: !!mention,
    title,
    slug,
    summary,
    ogImage,
    ctaUrl,
    ctaLabel,
    categories,
    faq,
    featured,
    publishedAt,
  };
}

// 최초 발행 시각을 DB에 1회 기록. DB가 source of truth이므로 여기서 써두면
// 이후 재빌드·다른 사람의 빌드에서도 같은 날짜가 유지된다.
async function stampPublishedAt(rowId, iso) {
  await api('PATCH', `pages/${rowId}`, {
    properties: {publishedAt: {date: {start: iso}}},
  });
}

// ---------- 외부 링크 OG 메타 (bookmark 카드용) ----------
const OG_CACHE = new Map();
const unent = s =>
  String(s || '')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim();
async function fetchOg(url) {
  if (OG_CACHE.has(url)) return OG_CACHE.get(url);
  if (RERENDER) {
    // OG 는 실패해도 카드가 URL 폴백으로 렌더되므로(정상 경로) 미스를 slug 스킵으로 올리지
    // 않는다. 단 조용히 폴백하면 커밋된 HTML 에 있던 제목이 URL 로 되돌아갈 수 있으므로
    // 반드시 경고한다 — 이게 뜨면 그 페이지는 --force 로 받아야 한다.
    const hit = cacheRead('og', url);
    if (hit === undefined)
      console.warn(
        `  ⚠️ --rerender: OG 캐시 없음(${url}) → 카드가 URL 폴백으로 렌더될 수 있음`,
      );
    const card = hit === undefined ? null : hit;
    OG_CACHE.set(url, card);
    return card;
  }
  let card = null;
  try {
    const res = await fetchWithTimeout(
      url,
      {headers: {'user-agent': 'Mozilla/5.0 (compatible; SccArticleBot/1.0)'}},
      15000,
      2,
    );
    if (res.ok) {
      const html = (await res.text()).slice(0, 300000);
      const meta = key => {
        const re = new RegExp(
          `<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']*)["']|<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${key}["']`,
          'i',
        );
        const m = html.match(re);
        return m ? unent(m[1] || m[2]) : '';
      };
      const title =
        meta('og:title') ||
        unent((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]);
      const image = meta('og:image');
      card = {
        title,
        desc: meta('og:description') || meta('description'),
        image: image ? new URL(image, url).href : '',
      };
    }
  } catch (e) {
    console.warn(`  ⚠️ bookmark OG 조회 실패(${url}): ${e.message}`);
  }
  OG_CACHE.set(url, card);
  cacheWrite('og', url, card);
  return card;
}

// ---------- 이미지 다운로드 (presigned 만료 대응) ----------
// assetsDir → 이번 빌드에서 실제로 쓴 파일명. 부모 렌더 도중 상세 페이지 빌드가
// 끼어들므로(buildDetailPage) 전역 Set 하나로는 안 되고 디렉토리별로 추적한다.
const usedAssets = new Map();
function markUsed(destDir, name) {
  if (!usedAssets.has(destDir)) usedAssets.set(destDir, new Set());
  usedAssets.get(destDir).add(name);
}

// article 디렉토리 준비: assets/ 는 남기고 나머지(index.html, 하위 상세 페이지)만 지운다.
// 왜: 예전엔 rmrf(srcDir)로 assets 까지 통째로 날린 뒤 다시 내려받아서, 다운로드가
// transient 실패하면 이미 발행돼 있던 이미지가 그대로 유실됐다. 안 쓰인 에셋은
// 렌더가 끝난 뒤 pruneUnusedAssets 로 정리한다.
// 하위 디렉토리(= 카드형 상세 페이지)도 남긴다. 각자 자기 prepareArticleDir 로 정리하며,
// 그래야 자식의 assets 도 같은 유실 보호를 받는다. 이번 빌드에서 발행 안 된 상세 페이지는
// 부모 렌더가 끝난 뒤 pruneUnusedSubPages 가 지운다.
function prepareArticleDir(srcDir) {
  const assetsDir = path.join(srcDir, 'assets');
  if (fs.existsSync(srcDir))
    for (const e of fs.readdirSync(srcDir, {withFileTypes: true}))
      if (e.isFile()) rmrf(path.join(srcDir, e.name));
  fs.mkdirSync(assetsDir, {recursive: true});
  usedAssets.set(assetsDir, new Set());
  return assetsDir;
}

// 부모 srcDir 안의 상세 페이지 디렉토리 중 이번 빌드에서 발행되지 않은 것(= DB에서 빠진 row)을 정리.
function pruneUnusedSubPages(srcDir, emitted) {
  const keep = new Set(emitted.map(m => path.basename(m.slug)));
  for (const e of fs.readdirSync(srcDir, {withFileTypes: true}))
    if (e.isDirectory() && e.name !== 'assets' && !keep.has(e.name))
      rmrf(path.join(srcDir, e.name));
}

function pruneUnusedAssets(assetsDir) {
  if (!fs.existsSync(assetsDir)) return;
  const used = usedAssets.get(assetsDir) || new Set();
  for (const f of fs.readdirSync(assetsDir))
    if (!used.has(f)) rmrf(path.join(assetsDir, f));
  if (fs.readdirSync(assetsDir).length === 0) rmrf(assetsDir);
}

// 다운로드 실패 시 같은 인덱스로 이미 커밋돼 있는 에셋을 재사용한다.
// 왜: notion.so/icons/*.svg 나 presigned URL 이 transient 403 을 내면, 예전엔 caller 가
// img 태그를 통째로 버려 "이미 발행돼 있던 이미지가 재빌드로 사라지는" 회귀가 났다
// (실제 사고: yeonghee-festival-… 콜아웃 아이콘 2개). 실패는 "이미지 없음"이 아니다.
// 재사용 = 이번 빌드에서 쓴 것이므로 여기서 markUsed 까지 한다 (안 그러면 prune 이 지운다).
function reuseExistingAsset(destDir, idx, prefix) {
  if (!fs.existsSync(destDir)) return null;
  const hit = fs
    .readdirSync(destDir)
    .find(f => new RegExp(`^${prefix}-${idx}\\.[a-z0-9]+$`, 'i').test(f));
  if (!hit) return null;
  markUsed(destDir, hit);
  return `assets/${hit}`;
}

// ---------- 이미지 판별 / HEIF 변환 ----------
// content-type 을 믿지 않고 매직바이트로 판정한다. Notion presigned URL 은 종종
// application/octet-stream 을 주고, OG 스크랩 실패는 200 + text/html 을 준다.
const IMAGE_MAGIC = [
  [0xff, 0xd8, 0xff], // jpeg
  [0x89, 0x50, 0x4e, 0x47], // png
  [0x47, 0x49, 0x46, 0x38], // gif
];

function isHeif(buf) {
  // ISO-BMFF: [4..8]='ftyp', 그 다음 브랜드가 heic/heix/mif1/msf1/hevc…
  if (buf.length < 12 || buf.toString('latin1', 4, 8) !== 'ftyp') return false;
  return /^(heic|heix|hevc|hevx|mif1|msf1|heim|heis|hevm|hevs)/.test(
    buf.toString('latin1', 8, 12),
  );
}

function isImage(buf, ct = '') {
  if (buf.length < 12) return false;
  if (IMAGE_MAGIC.some(sig => sig.every((b, i) => buf[i] === b))) return true;
  if (
    buf.toString('latin1', 0, 4) === 'RIFF' &&
    buf.toString('latin1', 8, 12) === 'WEBP'
  )
    return true;
  if (isHeif(buf)) return true;
  // svg 는 텍스트라 매직바이트가 없다 — content-type 으로만 통과시킨다.
  return ct.includes('svg') && buf.toString('utf8', 0, 512).includes('<svg');
}

// ponytail: macOS 내장 sips. 이 스크립트는 발행 담당자의 맥에서만 도는 파이프라인이라 충분하다.
// sharp(이미 devDependency)를 먼저 시도하지 않는 이유: 번들된 libheif 가 이 파일들을
// "Number of references in iref box exceeds security limits" 로 **전부** 거부한다(49/49 실측).
// 리눅스 CI 로 옮기게 되면 heif-convert(libheif-examples)로 갈아끼운다.
// HEIF 원본은 예외 없이 아이폰 카메라 풀해상도(4032px)라, 그대로 jpeg 로 풀면 장당 3MB+ 가 된다.
// 본문 셸은 480px 폭이고 기존 발행 사진들도 median 1280 / p90 2400px 이므로 1600 이면 충분하다.
const HEIF_MAX_EDGE = 1600;

function heifToJpeg(buf) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'scc-heif-'));
  const src = path.join(dir, 'in.heic');
  const out = path.join(dir, 'out.jpg');
  try {
    fs.writeFileSync(src, buf);
    execFileSync(
      'sips',
      [
        '-s',
        'format',
        'jpeg',
        '-s',
        'formatOptions',
        '85',
        '-Z',
        String(HEIF_MAX_EDGE),
        src,
        '--out',
        out,
      ],
      {stdio: 'ignore'},
    );
    return fs.readFileSync(out);
  } finally {
    rmrf(dir);
  }
}

async function downloadImage(url, destDir, idx, prefix = 'img') {
  fs.mkdirSync(destDir, {recursive: true});
  // --rerender 는 네트워크를 타지 않는다 — 커밋된 에셋을 그대로 재사용한다.
  // (reuseExistingAsset 이 markUsed 까지 하므로 pruneUnusedAssets 가 지우지 않는다.)
  // 없으면 그 slug 는 캐시가 불완전한 것이므로 --force 로 넘긴다.
  if (RERENDER) {
    const kept = reuseExistingAsset(destDir, idx, prefix);
    if (!kept) cacheMiss('asset', `${prefix}-${idx} @ ${destDir}`);
    return kept;
  }
  let res;
  try {
    res = await fetchWithTimeout(url, {}, 30000, 2);
  } catch (e) {
    const kept = reuseExistingAsset(destDir, idx, prefix);
    if (kept) {
      console.warn(
        `  ♻️ 다운로드 실패(${e.message}) → 기존 에셋 유지: ${kept}`,
      );
      return kept;
    }
    throw e;
  }
  if (!res.ok) {
    const kept = reuseExistingAsset(destDir, idx, prefix);
    if (kept) {
      console.warn(
        `  ♻️ 다운로드 실패(${res.status}) → 기존 에셋 유지: ${kept}`,
      );
      return kept;
    }
    throw new Error(`image ${res.status}`);
  }
  let buf = Buffer.from(await res.arrayBuffer());
  const ct = res.headers.get('content-type') || '';

  // 확장자를 content-type 에서 뽑되, **모르는 타입을 .jpg 로 뭉개지 않는다.**
  // 예전 폴백(`: 'jpg'`)은 image 가 아닌 응답까지 .jpg 로 저장해서, 브라우저가 디코드 못 하는
  // 파일이 조용히 발행됐다(2026-08-14 실측: HEIC 49 + OG 스크랩이 물어온 HTML 페이지 1건 = 50건).
  // 빌드/테스트는 다 통과하고 페이지만 깨지는 종류라, 여기서 막지 않으면 아무도 못 잡는다.
  if (!isImage(buf, ct)) {
    const kept = reuseExistingAsset(destDir, idx, prefix);
    if (kept) {
      console.warn(
        `  ♻️ 이미지가 아닌 응답(${ct || 'unknown'}) → 기존 에셋 유지: ${kept}`,
      );
      return kept;
    }
    throw new Error(`not an image (${ct || 'unknown'})`);
  }

  let ext = ct.includes('png')
    ? 'png'
    : ct.includes('webp')
      ? 'webp'
      : ct.includes('gif')
        ? 'gif'
        : ct.includes('svg')
          ? 'svg'
          : 'jpg';

  // 아이폰에서 올린 사진을 Notion 이 image/heic 그대로 준다. Chrome/Android 는 HEIF 를 디코드
  // 못 해서 확장자만 .jpg 로 붙이면 발행 페이지에서 깨진 이미지가 된다. jpeg 로 변환해 저장한다.
  if (isHeif(buf)) {
    buf = heifToJpeg(buf);
    ext = 'jpg';
  }

  const name = `${prefix}-${idx}.${ext}`;
  fs.writeFileSync(path.join(destDir, name), buf);
  markUsed(destDir, name);
  return `assets/${name}`;
}

// ---------- 목록 썸네일 생성 ----------
// 대표 이미지가 원본 PNG 그대로라 3~7MB짜리가 260pt 카드/목록 썸네일로 나간다. 앱 홈은 가장 자주
// 뜨는 화면이라 첫 로드 트래픽이 그대로 노출된다. manifest 전체를 돌며 thumb-0.webp를 만들고
// `thumbnail` 필드를 채운다 — 소비처(앱 홈, 웹 목록)는 `thumbnail ?? image`로 읽어 폴백이 있다.
//
// 렌더 경로(buildArticle)가 아니라 manifest 순회인 이유가 두 개다:
//  1) 빌드는 incremental이라(:changed 필터) 변경 없는 글은 통째로 스킵된다 → 기존 발행분을 백필 못 한다.
//  2) pruneUnusedAssets가 markUsed 안 된 파일을 지운다. mtime 비교로 "지워졌으면 다시 만든다"가 되어
//     prune 화이트리스트를 건드릴 필요가 없다.
const THUMB_NAME = 'thumb-0.webp';
const THUMB_MAX_WIDTH = 1024; // 앱 카드 260pt@3x=780px + 웹 히어로 카드까지 커버. ponytail: 단일 사이즈, srcset은 필요해지면.
const THUMB_QUALITY = 78;
// 소비처(앱 홈 카드, 웹 목록 카드)가 전부 16:9 박스라 파일도 16:9로 잘라둔다. 원본 비율을 유지하면
// 소비처마다 object-fit/resizeMode에 의존하게 되고, 하나라도 빠뜨리면 눌리거나 레터박스가 생긴다.
const THUMB_ASPECT = 16 / 9;

async function ensureThumbnails(manifest, srcDir = SRC_DIR) {
  let created = 0;
  let sharp = null; // 실제 생성이 필요할 때만 require — 전부 최신이면 미설치 환경에서도 안 깨진다.
  for (const entry of Object.values(manifest)) {
    // parent 엔트리(상세 페이지)는 앱·웹 목록 어디서도 썸네일로 안 쓰인다.
    if (entry.parent || !entry.image) continue;
    const srcPath = path.join(srcDir, entry.image.replace(/^\/articles\//, ''));
    if (!fs.existsSync(srcPath)) continue;
    const destPath = path.join(path.dirname(srcPath), THUMB_NAME);
    const thumbUrl = `/articles/${entry.slug}/assets/${THUMB_NAME}`;
    if (
      fs.existsSync(destPath) &&
      fs.statSync(destPath).mtimeMs >= fs.statSync(srcPath).mtimeMs
    ) {
      entry.thumbnail = thumbUrl;
      continue;
    }
    sharp = sharp || require('sharp');
    // 타깃 크기를 원본에서 계산한다. resize에 withoutEnlargement를 주면 sharp가 크롭 자체를
    // 건너뛰고 원본 비율을 그대로 뱉어서(891x531 → 891x531) 16:9 보장이 깨진다.
    // 확대 없이 16:9를 채우려면 폭이 원본 폭뿐 아니라 **원본 높이**에도 묶여야 한다 —
    // 가로가 긴 원본(1024x410)은 세로가 모자라서, 폭만 보고 1024를 잡으면 1.4배 확대된다.
    const meta = await sharp(srcPath).metadata();
    const width = Math.round(
      Math.min(
        THUMB_MAX_WIDTH,
        meta.width || THUMB_MAX_WIDTH,
        (meta.height || THUMB_MAX_WIDTH) * THUMB_ASPECT,
      ),
    );
    const height = Math.round(width / THUMB_ASPECT);
    await sharp(srcPath)
      // 가로가 길든 세로가 길든 확대해서 중앙만 남긴다.
      .resize(width, height, {fit: 'cover', position: 'centre'})
      .webp({quality: THUMB_QUALITY})
      .toFile(destPath);
    entry.thumbnail = thumbUrl;
    created++;
  }
  if (created)
    console.log(`  🖼️  썸네일 생성 ${created}건 (16:9 중앙크롭 webp)`);
  return created;
}

// ---------- rich text → inline HTML (Notion 팔레트 그대로) ----------
const TEXT_COLOR = {
  gray: '#787774',
  brown: '#976d57',
  orange: '#cc782f',
  yellow: '#c29343',
  green: '#548164',
  blue: '#487ca5',
  purple: '#8a67ab',
  pink: '#b35488',
  red: '#c4554d',
};
// Notion 현행 팔레트(--c-{col}BacSec). notion.site 퍼블리시 페이지의 computed style로 실측.
const BG_COLOR = {
  gray: '#f0efed',
  brown: '#f5ede9',
  orange: '#fbebde',
  yellow: '#f9f3dc',
  green: '#e8f1ec',
  blue: '#e5f2fc',
  purple: '#f3ebf9',
  pink: '#fae9f1',
  red: '#fce9e7',
};
function renderRich(rich) {
  return (rich || [])
    .map(r => {
      const a = r.annotations || {};
      const annotate = line => {
        let t = esc(line);
        if (a.code) t = `<code>${t}</code>`;
        if (a.bold) t = `<strong>${t}</strong>`;
        if (a.italic) t = `<em>${t}</em>`;
        if (a.strikethrough) t = `<s>${t}</s>`;
        if (a.underline) t = `<u>${t}</u>`;
        if (a.color && a.color !== 'default') {
          if (a.color.endsWith('_background')) {
            const c = a.color.replace('_background', '');
            const bg = BG_COLOR[c] || c;
            // Notion 인라인 하이라이트는 padding/radius 없이 배경만 — 넣으면 인접 하이라이트
            // 사이가 흰 틈으로 끊긴다(🙌 + 링크 사례)
            t = `<span style="background:${bg};">${t}</span>`;
          } else {
            t = `<span style="color:${TEXT_COLOR[a.color] || a.color};">${t}</span>`;
          }
        }
        return t;
      };
      // Notion shift+enter(\n) → <br>. 줄바꿈은 스타일 span **밖**에 둔다 —
      // 안에 넣으면 배경색이 빈 줄까지 칠해진다(Notion은 안 칠함). (후원 섹션 실제 사고)
      let t = String(r.plain_text || '')
        .split('\n')
        .map(line => (line === '' ? '' : annotate(line)))
        .join('<br>');
      if (r.href) {
        const h = fixHref(r.href);
        t = `<a href="${esc(h)}"${linkAttrs(h)}>${t}</a>`;
      }
      return t;
    })
    .join('');
}

// ---------- Notion block-level color → inline style ----------
// 텍스트색 vs 배경색(_background). default는 스타일 없음.
function colorStyle(color) {
  if (!color || color === 'default') return '';
  if (color.endsWith('_background')) {
    const c = color.replace('_background', '');
    return ` style="background:${BG_COLOR[c] || c};padding:3px 8px;border-radius:4px;"`;
  }
  return ` style="color:${TEXT_COLOR[color] || color};"`;
}
// callout color는 배경 의미. Notion 실측: 컬러=--c-{col}BacSec, gray=--c-graBacPri(#f9f8f7,
// 인라인 회색 하이라이트보다 옅다), default(=배경 없음)=투명 + 1px 테두리.
function calloutBgStyle(color) {
  const c = (color || 'default').replace('_background', '');
  if (c === 'default')
    return 'background:transparent;border:1px solid rgba(28,19,1,.11);';
  if (c === 'gray') return 'background:#f9f8f7;';
  return `background:${BG_COLOR[c] || '#f9f8f7'};`;
}
// callout 아이콘을 Notion 원본대로 렌더 — emoji는 그대로, 빌트인/외부/파일 아이콘은 이미지로 다운로드,
// 아이콘이 없으면(icon:null) 웹도 아이콘 없음(💡 강제 금지).
async function renderCalloutIcon(icon, ctx) {
  if (!icon) return '';
  if (icon.type === 'emoji')
    return `<span class="emoji">${esc(icon.emoji)}</span>`;
  let url = '';
  if (icon.type === 'external') url = icon.external?.url;
  else if (icon.type === 'file') url = icon.file?.url;
  else if (icon.type === 'custom_emoji') url = icon.custom_emoji?.url;
  else if (icon.type === 'icon' && icon.icon?.name)
    url = `https://www.notion.so/icons/${icon.icon.name}_${icon.icon.color || 'gray'}.svg`;
  if (!/^https?:/i.test(url || '')) return '';
  // notion.so/icons/*.svg 가 403을 주는 케이스는 downloadImage 의 reuseExistingAsset 폴백이
  // 처리한다(같은 인덱스의 기존 에셋 재사용) — 여기서 따로 캐싱하지 않는다. (#235)
  try {
    const rel = await downloadImage(url, ctx.assetsDir, ctx.imgIdx++);
    return `<img class="callout-ico" src="/articles/${ctx.slug}/${rel}" alt="" aria-hidden="true">`;
  } catch (e) {
    console.warn(`  ⚠️ callout 아이콘 다운로드 실패: ${e.message}`);
    return '';
  }
}
// Notion 내부 링크 remap: 페이지-id 경로/노션 도메인은 죽은 링크 → 우리 URL(LINK_MAP)이나 /articles로.
// 페이지 내 앵커(#블록id)는 로컬 앵커(#하이픈제거 hex)로 유지 — heading id와 매칭.
function fixHref(href) {
  if (!href) return href;
  if (href.startsWith('#')) return '#' + noHy(href.slice(1));
  const hashIdx = href.indexOf('#');
  if (hashIdx >= 0) {
    const frag = noHy(href.slice(hashIdx + 1));
    if (/^[0-9a-f]{16,}$/.test(frag)) return '#' + frag; // in-page 점프
  }
  const isNotion =
    /^\/[0-9a-f-]{20,}/i.test(href) ||
    /(notion\.so|notion\.site|app\.notion\.com)/i.test(href);
  if (isNotion) {
    const m = href.match(/[0-9a-f]{32}/i);
    const id = m ? noHy(m[0]) : null;
    if (id && LINK_MAP[id]) return LINK_MAP[id];
    return '/articles';
  }
  return href;
}

// 외부 링크는 새 탭. 본문을 읽다 CTA(카카오톡/저장리스트/예매 등)를 누르면 글에서
// 튕겨나가던 문제. 같은 사이트 경로(/articles/…)와 인페이지 앵커(#)는 기존대로 현재 탭.
function linkAttrs(href) {
  const external =
    /^https?:\/\//i.test(href || '') && !String(href).startsWith(SITE.baseUrl);
  return external
    ? ' target="_blank" rel="noopener noreferrer"'
    : ' rel="noopener"';
}

// ---------- child_database (인라인 DB) → 표 ----------
function pill(name, color) {
  const c = (color || 'default').replace('_background', '');
  return `<span class="pill" style="background:${BG_COLOR[c] || 'var(--soft)'};">${esc(name)}</span>`;
}
function renderPropValue(prop) {
  if (!prop) return '';
  switch (prop.type) {
    case 'title':
      return renderRich(prop.title);
    case 'rich_text':
      return renderRich(prop.rich_text);
    case 'select':
      return prop.select ? pill(prop.select.name, prop.select.color) : '';
    case 'status':
      return prop.status ? pill(prop.status.name, prop.status.color) : '';
    case 'multi_select':
      return (prop.multi_select || [])
        .map(o => pill(o.name, o.color))
        .join(' ');
    case 'number':
      return prop.number == null ? '' : esc(String(prop.number));
    case 'checkbox':
      return prop.checkbox ? '✓' : '';
    case 'url':
      return prop.url
        ? `<a href="${esc(prop.url)}"${linkAttrs(prop.url)}>${esc(prop.url)}</a>`
        : '';
    case 'email':
      return prop.email ? esc(prop.email) : '';
    case 'phone_number':
      return prop.phone_number ? esc(prop.phone_number) : '';
    case 'date':
      return prop.date
        ? esc(prop.date.start + (prop.date.end ? ` ~ ${prop.date.end}` : ''))
        : '';
    default:
      return '';
  }
}
// child_database 블록 id → Notion 인라인 뷰의 컬럼 순서(공식 API 미제공이라 수동 지정).
// 값 없는 컬럼은 렌더 시 자동 제외되므로, 뷰에 보이는 순서를 그대로 나열하면 된다.
const COLUMN_ORDER = {
  // 흑백요리사2 (백/흑)
  '2e4c9499-b060-8138-9b78-d697d0b2ea98': [
    '셰프명',
    '식당',
    '주요역',
    '접근레벨',
    '층수',
    '계단정보',
    '내부',
    '코멘트',
  ],
  '2e4c9499-b060-80ab-9fcb-f836bff1223f': [
    '셰프명',
    '식당',
    '주요역',
    '접근레벨',
    '층수',
    '계단정보',
    '내부',
    '코멘트',
  ],
  // 흑백요리사1 (미리보기)
  '125c9499-b060-8114-9568-e5a77f6177c8': [
    '셰프명',
    '식당',
    '주요역',
    '접근레벨',
    '층수',
    '계단정보',
    '내부',
    '코멘트',
  ],
  // BTS 맛집 22곳
  '254c9499-b060-80c6-a70a-ff34ea40d8c1': [
    '식당명',
    '멤버별',
    '지역',
    '접근레벨',
    '층수',
    '입구계단',
    '코멘트',
    '지도링크',
  ],
  // 전국 모음.zip (지역별 5개 — 갤러리 뷰, 카드 필드 순서)
  'c95bbf72-71c6-439c-afa1-c60a3f6e99ee': [
    '이름',
    '특징 한줄',
    '카테고리',
    '장소',
    '실제주소',
    '대상',
    '추천이유',
    '대표링크',
  ],
  '3b7d3ecc-1598-4f13-b6b1-70d18e457d46': [
    '이름',
    '특징한줄',
    '카테고리',
    '장소',
    '실제주소',
    '대상',
    '추천이유',
    '대표링크',
  ],
  '8cf44368-9bd8-4ddf-a030-3d1b95ce334c': [
    '이름',
    '특징 한줄',
    '카테고리',
    '장소',
    '실제주소',
    '대상',
    '추천이유',
    '대표링크',
  ],
  'b9f627e1-b66e-4ee6-b77c-fbfca4b5c7dd': [
    '이름',
    '특징한줄',
    '카테고리',
    '장소',
    '실제주소',
    '대상',
    '추천이유',
    '대표링크',
  ],
  'da732f1f-9321-4a6d-ad4e-21f903fb406b': [
    '이름',
    '특징한줄',
    '카테고리',
    '장소',
    '실제주소',
    '대상',
    '추천이유',
    '대표링크',
  ],
  // 콜택시
  '0cbe49a5-d081-4806-880f-26e875001a7b': [
    '지역(클릭)',
    '차량운영시간',
    '콜택시 전화번호',
    '콜택시 어플이름(링크)',
    '문의처',
  ],
  // 고양종합운동장
  '33ac9499-b060-81f8-8c3c-f2e8b2f2a8e1': [
    '식당명',
    'Tags',
    '위치',
    '접근레벨',
    '계단정보',
    '내부',
  ],
  // KSPO DOME (추천 / 식당 / 카페·편의점). "[추천]"(16bc…8094)은 standalone 미공개라
  // 뷰 순서 직접 확인 불가 → 형제 DB 순서를 적용(누락 컬럼 Tags/주소/주요역은 자동 후미 append).
  '16bc9499-b060-8094-9f65-f115c7b20a50': [
    '식당명',
    '위치',
    '접근레벨',
    '층수',
    '계단정보',
    '내부',
    '코멘트',
  ],
  '165c9499-b060-80db-a208-e78b27abca7a': [
    '식당명',
    '위치',
    '접근레벨',
    '층수',
    '계단정보',
    '내부',
    '코멘트',
  ],
  '16bc9499-b060-805c-9962-f29a783f371a': [
    '식당명',
    '위치',
    '접근레벨',
    '층수',
    '계단정보',
    '내부',
    '코멘트',
  ],
};

// 컬럼 순서 결정(COLUMN_ORDER = Notion 뷰 순서 수동 지정, 없으면 스키마순+title우선)
function orderedCols(dbId, nonEmpty, titleName, quiet) {
  const preferred = COLUMN_ORDER[dbId];
  if (preferred) {
    const cols = preferred.filter(n => nonEmpty.includes(n));
    for (const n of nonEmpty) if (!cols.includes(n)) cols.push(n);
    return cols;
  }
  if (!quiet)
    console.warn(
      `  ⚠️ child_database 컬럼 순서 미지정(${dbId}) — Notion 뷰 순서 확인 필요, 스키마 순서로 폴백`,
    );
  return titleName && nonEmpty.includes(titleName)
    ? [titleName, ...nonEmpty.filter(n => n !== titleName)]
    : nonEmpty;
}

// 컬럼 + 폭 결정. v3(ctx.dbLayout)에 뷰 순서·컬럼 폭(px)이 있으면 그걸로
// table-layout:fixed + <colgroup>(Notion 컬럼 폭 그대로, 코멘트 456px 등). 없으면 COLUMN_ORDER 폴백.
// extraWidths: 합성 컬럼('사진' 등) 폭(px) — cols엔 안 들어가고 colgroup 끝에만 추가.
function resolveCols(ctx, dbId, nonEmpty, titleName, quiet, extraWidths = []) {
  const layout = ctx.dbLayout && ctx.dbLayout[dbId];
  let cols;
  let widths = null;
  if (layout && layout.length) {
    const seen = new Set();
    cols = [];
    widths = [];
    for (const c of layout)
      if (nonEmpty.includes(c.name) && !seen.has(c.name)) {
        cols.push(c.name);
        widths.push(c.width);
        seen.add(c.name);
      }
    for (const n of nonEmpty)
      if (!seen.has(n)) {
        cols.push(n);
        widths.push(null);
      }
  } else {
    cols = orderedCols(dbId, nonEmpty, titleName, quiet);
  }
  if (widths) {
    const colgroup = `<colgroup>${widths
      .concat(extraWidths)
      .map(w => (w ? `<col style="width:${Math.round(w)}px">` : '<col>'))
      .join('')}</colgroup>`;
    return {cols, colgroup, tableOpen: '<table style="table-layout:fixed">'};
  }
  return {cols, colgroup: '', tableOpen: '<table>'};
}

// row 본문이 "리치"(사진 외 구조화 콘텐츠: heading/callout/텍스트/리스트/표)인가?
// 사진만 있는 본문(image/divider/빈 문단)은 리치 아님 → 표에 썸네일 인라인.
function bodyIsRich(blocks) {
  for (const b of blocks || []) {
    const t = b.type;
    if (t === 'image' || t === 'divider') continue;
    if (t === 'paragraph') {
      if ((b.paragraph.rich_text || []).length) return true;
      if (b.__children && bodyIsRich(b.__children)) return true;
      continue;
    }
    if (t === 'column_list' || t === 'column') {
      if (b.__children && bodyIsRich(b.__children)) return true;
      continue;
    }
    return true;
  }
  return false;
}
// row 본문 내 이미지들을 다운로드해 썸네일 <img>로(표 '사진' 셀용)
async function renderRowImages(blocks, ctx) {
  let html = '';
  for (const b of blocks || []) {
    if (b.type === 'image') {
      const d = b.image;
      const url = d.type === 'external' ? d.external.url : d.file.url;
      if (!/^https?:/i.test(url || '') || /seeyoufarm\.com/i.test(url))
        continue;
      try {
        const rel = await downloadImage(url, ctx.assetsDir, ctx.imgIdx++);
        html += `<img class="db-thumb" src="/articles/${ctx.slug}/${rel}" loading="lazy" alt="${esc(plain(d.caption) || '')}">`;
      } catch (e) {
        console.warn(`  ⚠️ 이미지 다운로드 실패: ${e.message}`);
      }
    } else if (b.__children) {
      html += await renderRowImages(b.__children, ctx);
    }
  }
  return html;
}

// 카드형 row 하나 → 독립 상세 페이지 발행. 반환: {url, image, manifest}
async function buildDetailPage(
  row,
  parentSlug,
  nonTitleProps,
  titleName,
  publishedAt,
  cta, // 부모의 {url, label} — 하위 페이지는 CTA 를 상속한다
) {
  const meta = SUBPAGES[row.id] || {};
  const rslug = meta.slug || noHy(row.id).slice(0, 20);
  const fullSlug = `${parentSlug}/${rslug}`;
  const titlePlain =
    plain((row.properties[titleName] || {}).title) || '(제목 없음)';
  const srcDir = path.join(SRC_DIR, parentSlug, rslug);
  const assetsDir = prepareArticleDir(srcDir);
  const layout = await fetchPageLayout(row.id);
  const ctx = {
    assetsDir,
    imgIdx: 0,
    bmIdx: 0,
    firstImage: null,
    title: titlePlain,
    slug: fullSlug,
    emittedSubPages: [],
    headings: [],
    imgLayout: layout.img,
    dbLayout: layout.db,
  };
  const body = row.__children || (await fetchChildren(row.id));
  indexHeadings(body, ctx);
  // 상세 페이지 상단에 접근성 프로퍼티 요약(접근레벨/위치 등) 표시
  const propHtml = nonTitleProps.length
    ? `<div class="db-detail-props">${nonTitleProps
        .map(
          n =>
            `<span class="db-prop"><b>${esc(n)}</b> ${renderPropValue(row.properties[n])}</span>`,
        )
        .join('')}</div>`
    : '';
  const contentHtml = propHtml + (await renderBlocks(body, ctx));
  const ogImageUrl = ctx.firstImage ? `${SITE.baseUrl}${ctx.firstImage}` : '';
  const html = renderArticlePage({
    title: titlePlain,
    summary: meta.summary || '',
    slug: fullSlug,
    faq: [],
    contentHtml,
    ogImageUrl,
    publishedAt,
    lastEditedTime: row.last_edited_time,
    backHref: `/articles/${parentSlug}`,
    ctaUrl: (cta || {}).url,
    ctaLabel: (cta || {}).label,
  });
  fs.writeFileSync(path.join(srcDir, 'index.html'), html);
  pruneUnusedAssets(assetsDir);
  return {
    url: `/articles/${fullSlug}/`,
    image: ctx.firstImage || '',
    titlePlain,
    summary: meta.summary || '',
    manifest: {
      slug: fullSlug,
      title: titlePlain,
      summary: meta.summary || '',
      image: ctx.firstImage || '',
      createdTime: row.created_time,
      publishedAt,
      editedTime: row.last_edited_time,
      contentPageId: row.id,
      parent: parentSlug,
    },
  };
}

// 인라인 DB 렌더. row에 하위 페이지 본문이 있으면(카드형) → row별 상세 페이지 발행 +
// 링크(카드 그리드 / 링크 표). 본문이 없으면(프로퍼티형) → 기존 가로스크롤 표.
async function renderChildDatabase(dbId, title, ctx) {
  let rows;
  try {
    rows = await queryDb(dbId);
  } catch (e) {
    console.warn(`  ⚠️ child_database 쿼리 실패(${dbId}): ${e.message}`);
    return '';
  }
  if (!rows.length) return '';
  const names = Object.keys(rows[0].properties || {});
  const titleName = names.find(n => rows[0].properties[n].type === 'title');
  const hasValue = n =>
    rows.some(r => renderPropValue(r.properties[n]).trim() !== '');
  const nonEmpty = names.filter(hasValue);
  const nonTitleProps = nonEmpty.filter(n => n !== titleName);
  // Notion 인라인 DB는 제목이 표 위에 온다 → 표 상단 제목으로 렌더(하단 figcaption 아님)
  const dbTitle = title ? `<p class="db-title">${esc(title)}</p>` : '';

  // 본문 보유 여부 감지(앞 3개 row 샘플)
  const sample = rows.slice(0, 3);
  for (const r of sample) r.__children = await fetchChildren(r.id);
  const bodyBearing = sample.some(r => (r.__children || []).length);

  if (bodyBearing) {
    for (const r of rows)
      if (!r.__children) r.__children = await fetchChildren(r.id);
    const rich = sample.some(r => bodyIsRich(r.__children));
    const haveMeta = rows.some(r => SUBPAGES[r.id]);

    // 리치 본문(구조화된 상세) + 메타 있음 → row별 상세 페이지 발행 + 링크(카드/링크표)
    if (rich && haveMeta) {
      const items = [];
      for (const r of rows) {
        const d = await buildDetailPage(
          r,
          ctx.slug,
          nonTitleProps,
          titleName,
          ctx.publishedAt,
          ctx.cta,
        );
        ctx.emittedSubPages.push(d.manifest);
        items.push(d);
      }
      if (nonTitleProps.length <= 1) {
        const cards = items
          .map(
            it =>
              `<a class="db-card" href="${it.url}">${
                it.image
                  ? `<img class="db-card-thumb" src="${esc(it.image)}" alt="${esc(it.titlePlain)}" loading="lazy">`
                  : ''
              }<div class="db-card-body"><b>${esc(it.titlePlain)}</b>${it.summary ? `<p>${esc(it.summary)}</p>` : ''}</div></a>`,
          )
          .join('');
        return `<figure class="db">${dbTitle}<div class="db-cards">${cards}</div></figure>`;
      }
      const {cols, colgroup, tableOpen} = resolveCols(
        ctx,
        dbId,
        nonEmpty,
        titleName,
        true,
      );
      const head = `<tr>${cols.map(n => `<th>${esc(n)}</th>`).join('')}</tr>`;
      const body = rows
        .map((r, i) => {
          const url = items[i].url;
          return `<tr>${cols
            .map(n =>
              n === titleName
                ? `<td><a href="${url}">${renderPropValue(r.properties[n])}</a></td>`
                : `<td>${renderPropValue(r.properties[n])}</td>`,
            )
            .join('')}</tr>`;
        })
        .join('');
      return `<figure class="db">${dbTitle}<div class="db-wrap">${tableOpen}${colgroup}${head}${body}</table></div></figure>`;
    }

    // 그 외 본문 보유(주로 사진만) → 상세 페이지 안 만들고 표에 사진 컬럼 인라인(콘텐츠 유실 방지)
    if (rich && !haveMeta)
      console.warn(
        `  ⚠️ 리치 본문 DB인데 subpages 메타 없음(${dbId} "${title}") — 표+사진 인라인 폴백. 메타 생성 권장`,
      );
    const {cols, colgroup, tableOpen} = resolveCols(
      ctx,
      dbId,
      nonEmpty,
      titleName,
      true,
      [140],
    );
    const head = `<tr>${cols.map(n => `<th>${esc(n)}</th>`).join('')}<th>사진</th></tr>`;
    let body = '';
    for (const r of rows) {
      const thumbs = await renderRowImages(r.__children, ctx);
      body += `<tr>${cols.map(n => `<td>${renderPropValue(r.properties[n])}</td>`).join('')}<td>${thumbs}</td></tr>`;
    }
    return `<figure class="db">${dbTitle}<div class="db-wrap">${tableOpen}${colgroup}${head}${body}</table></div></figure>`;
  }

  // 프로퍼티형 → 기존 표
  const {cols, colgroup, tableOpen} = resolveCols(
    ctx,
    dbId,
    nonEmpty,
    titleName,
  );
  if (!cols.length) return '';
  const head = `<tr>${cols.map(n => `<th>${esc(n)}</th>`).join('')}</tr>`;
  const body = rows
    .map(
      r =>
        `<tr>${cols.map(n => `<td>${renderPropValue(r.properties[n])}</td>`).join('')}</tr>`,
    )
    .join('');
  return `<figure class="db">${dbTitle}<div class="db-wrap">${tableOpen}${colgroup}${head}${body}</table></div></figure>`;
}

// heading: id 부여(앵커) + is_toggleable면 <details>로 접기/펼치기 모방
async function renderHeading(tag, b, d, ctx) {
  const h = `<${tag} id="${noHy(b.id)}"${colorStyle(d.color)}>${renderRich(d.rich_text)}</${tag}>`;
  if (d.is_toggleable && b.__children)
    return `<details class="htoggle"><summary>${h}</summary>${await renderBlocks(b.__children, ctx)}</details>`;
  return h;
}
// TOC용 heading 사전 수집(렌더 전 1회). child_database row 본문은 별도 페이지라 제외됨.
function indexHeadings(blocks, ctx) {
  for (const b of blocks || []) {
    if (/^heading_[123]$/.test(b.type)) {
      const text = plain((b[b.type] || {}).rich_text).trim();
      if (text)
        ctx.headings.push({
          id: noHy(b.id),
          text,
          level: Number(b.type.slice(-1)),
        });
    }
    if (b.__children) indexHeadings(b.__children, ctx);
  }
}

// ---------- blocks → HTML ----------
async function renderBlocks(blocks, ctx) {
  let html = '';
  let i = 0;
  while (i < blocks.length) {
    const b = blocks[i];
    if (b.type === 'bulleted_list_item' || b.type === 'numbered_list_item') {
      const tag = b.type === 'bulleted_list_item' ? 'ul' : 'ol';
      let items = '';
      while (i < blocks.length && blocks[i].type === b.type) {
        const it = blocks[i];
        const inner = it.__children
          ? await renderBlocks(it.__children, ctx)
          : '';
        items += `<li>${renderRich(it[it.type].rich_text)}${inner}</li>`;
        i++;
      }
      html += `<${tag}>${items}</${tag}>`;
      continue;
    }
    html += await renderBlock(b, ctx);
    i++;
  }
  return html;
}
async function renderBlock(b, ctx) {
  const t = b.type;
  const d = b[t] || {};
  switch (t) {
    case 'paragraph': {
      // paragraph도 하위 블록을 가질 수 있다(전국모음 '추가 정보' 섹션) → 반드시 재귀
      const inner = b.__children ? await renderBlocks(b.__children, ctx) : '';
      // 빈 문단(내용·하위블록 없음)도 Notion의 의도된 줄간격이므로 공백 블록으로 보존
      if (!d.rich_text.length) return inner || '<p class="empty"></p>';
      return `<p${colorStyle(d.color)}>${renderRich(d.rich_text)}</p>${inner}`;
    }
    case 'heading_1':
      return await renderHeading('h2', b, d, ctx);
    case 'heading_2':
      return await renderHeading('h3', b, d, ctx);
    case 'heading_3':
      return await renderHeading('h4', b, d, ctx);
    case 'to_do': {
      // 중첩 체크리스트 하위 항목 유실 방지 → __children 재귀
      const inner = b.__children ? await renderBlocks(b.__children, ctx) : '';
      return `<p><input type="checkbox" disabled ${d.checked ? 'checked' : ''}> ${renderRich(d.rich_text)}</p>${inner}`;
    }
    case 'quote':
      return `<blockquote>${renderRich(d.rich_text)}${b.__children ? await renderBlocks(b.__children, ctx) : ''}</blockquote>`;
    case 'callout': {
      const iconHtml = await renderCalloutIcon(d.icon, ctx);
      const inner = b.__children ? await renderBlocks(b.__children, ctx) : '';
      return `<aside class="callout" style="${calloutBgStyle(d.color)}">${iconHtml}<div>${renderRich(d.rich_text)}${inner}</div></aside>`;
    }
    case 'toggle': {
      const inner = b.__children ? await renderBlocks(b.__children, ctx) : '';
      return `<details><summary>${renderRich(d.rich_text)}</summary>${inner}</details>`;
    }
    case 'code':
      return `<pre><code>${esc(plain(d.rich_text))}</code></pre>`;
    case 'divider':
      return '<hr>';
    case 'image': {
      const url = d.type === 'external' ? d.external.url : d.file.url;
      // 트래킹 픽셀(seeyoufarm 등)·비-http(file: 첨부) 이미지는 건너뛴다
      if (!/^https?:/i.test(url || '') || /seeyoufarm\.com/i.test(url))
        return '';
      const cap = d.caption && d.caption.length ? renderRich(d.caption) : '';
      let src = url;
      try {
        const rel = await downloadImage(url, ctx.assetsDir, ctx.imgIdx++); // "assets/img-N.ext"
        // 루트절대경로: 클린 URL(/articles/slug, 끝 슬래시 없음)에서도 안 깨진다
        src = `/articles/${ctx.slug}/${rel}`;
        if (!ctx.firstImage) ctx.firstImage = src;
      } catch (e) {
        console.warn(`  ⚠️ 이미지 다운로드 실패: ${e.message}`);
      }
      // Notion 표시 폭/정렬 반영(비공식 v3에서 수집). full-width면 100%, 아니면 block_width로 캡.
      const lay = ctx.imgLayout && ctx.imgLayout[b.id];
      let imgStyle = '';
      if (lay && !lay.full && lay.w) {
        const w = Math.round(lay.w);
        // Notion 기본 정렬은 중앙(block_alignment 없으면 center) — Oopy와 동일. left만 좌측.
        const m =
          lay.align === 'left'
            ? ''
            : lay.align === 'right'
              ? 'margin-left:auto;'
              : 'margin-left:auto;margin-right:auto;';
        // min(폭,100%)로 좁은 화면에선 컨테이너 안으로 캡(모바일 가로 넘침 방지)
        imgStyle = ` style="max-width:min(${w}px,100%);${m}"`;
      }
      return `<figure><img src="${esc(src)}"${imgStyle} alt="${esc(plain(d.caption) || ctx.title)}" loading="lazy">${cap ? `<figcaption>${cap}</figcaption>` : ''}</figure>`;
    }
    case 'bookmark':
    case 'embed': {
      const url = d.url || '';
      if (!url) return '';
      // Notion과 동일한 북마크 카드(썸네일 + 제목/설명/URL). 내부 글은 manifest에서,
      // 외부 링크는 OG 메타를 긁어서 채운다.
      const urlPath = url.replace(SITE.baseUrl, '').replace(/\/$/, '');
      const internal = CARD_BY_PATH[urlPath];
      const card = internal || (await fetchOg(url)) || {};
      let thumb = internal ? card.image : '';
      if (!internal && card.image) {
        try {
          const rel = await downloadImage(
            card.image,
            ctx.assetsDir,
            ctx.bmIdx++,
            'bm',
          );
          thumb = `/articles/${ctx.slug}/${rel}`;
        } catch (e) {
          console.warn(`  ⚠️ bookmark 썸네일 실패(${url}): ${e.message}`);
        }
      }
      const href = internal ? urlPath : url;
      const title = card.title || url;
      const body =
        `<span class="bm-body"><span class="bm-title">${esc(title)}</span>` +
        (card.desc ? `<span class="bm-desc">${esc(card.desc)}</span>` : '') +
        // OG 제목을 못 얻으면 제목 자리에 URL이 오므로 URL 줄은 생략(같은 문자열 2번 금지)
        (title === url ? '' : `<span class="bm-url">${esc(url)}</span>`) +
        `</span>`;
      return thumb
        ? `<a class="bookmark" href="${esc(href)}"${linkAttrs(href)}><span class="bm-thumb"><img src="${esc(thumb)}" alt="" loading="lazy"></span>${body}</a>`
        : `<a class="bookmark no-thumb" href="${esc(href)}"${linkAttrs(href)}>${body}</a>`;
    }
    // 탭 컨테이너 자체엔 텍스트가 없다(API가 `tab: {}`) — 하위 블록을 펼쳐 렌더하지 않으면 본문이 통째로 유실된다
    case 'tab':
      return b.__children ? await renderBlocks(b.__children, ctx) : '';
    case 'column_list': {
      let cols = '';
      for (const col of b.__children || [])
        cols += `<div class="column">${col.__children ? await renderBlocks(col.__children, ctx) : ''}</div>`;
      return `<div class="columns">${cols}</div>`;
    }
    case 'table': {
      const rows = b.__children || [];
      const body = rows
        .map(
          (r, ri) =>
            `<tr>${r.table_row.cells
              .map(c => {
                const tag = ri === 0 && d.has_column_header ? 'th' : 'td';
                return `<${tag}>${renderRich(c)}</${tag}>`;
              })
              .join('')}</tr>`,
        )
        .join('');
      // 스크롤 컨테이너로 감싼다 — 안 감싸면 넓은 표가 페이지를 통째로 가로 스크롤시킨다
      return `<div class="tbl-wrap"><table>${body}</table></div>`;
    }
    case 'child_database':
      return await renderChildDatabase(b.id, d.title, ctx);
    case 'table_of_contents':
      // heading id로 실제 앵커 점프하는 목차 렌더(사전 인덱싱된 ctx.headings 사용)
      return (ctx.headings || []).length
        ? `<nav class="toc">${ctx.headings
            .map(
              h =>
                `<a class="toc-l${h.level}" href="#${h.id}">${esc(h.text)}</a>`,
            )
            .join('')}</nav>`
        : '';
    case 'video':
    case 'file':
    case 'pdf': {
      const url = d.type === 'external' ? d.external?.url : d.file?.url;
      return url
        ? `<p><a href="${esc(url)}"${linkAttrs(url)}>${esc(t)}: ${esc(url)}</a></p>`
        : '';
    }
    default:
      if (d.rich_text) return `<p>${renderRich(d.rich_text)}</p>`;
      // 블록 id를 함께 찍어야 어느 블록이 유실됐는지 추적 가능
      console.warn(
        `  ⚠️ 미지원 블록(스킵): ${t} (id=${b.id}, has_children=${b.has_children})`,
      );
      return '';
  }
}

// ---------- 한 article 생성 ----------
async function buildArticle(meta, times) {
  const slug = meta.slug;
  const srcDir = path.join(SRC_DIR, slug);
  const assetsDir = prepareArticleDir(srcDir);

  const blocks = await fetchChildren(meta.contentPageId);
  const layout = await fetchPageLayout(meta.contentPageId);
  const ctx = {
    assetsDir,
    imgIdx: 0,
    bmIdx: 0,
    firstImage: null,
    title: meta.title,
    slug,
    emittedSubPages: [], // 카드형 DB row들의 상세 페이지(부모 렌더 중 발행)
    headings: [],
    imgLayout: layout.img,
    dbLayout: layout.db,
    publishedAt: times.publishedAt, // 상세 페이지도 부모와 같은 발행일을 쓴다
    // 하위 상세 페이지는 부모의 CTA 를 상속한다. 목록 페이지에 노출되지 않고 카테고리도 없어서
    // 자기 CTA 를 가질 근거가 없다 (장소별 딥링크는 전 코퍼스에 1개뿐이라 backfill 패턴이 없다).
    cta: {url: meta.ctaUrl, label: meta.ctaLabel},
  };
  indexHeadings(blocks, ctx);
  const contentHtml = await renderBlocks(blocks, ctx);

  // ctx.firstImage = "/articles/<slug>/assets/img-0.ext" (루트절대) → og는 도메인 붙여 절대 URL
  const ogImageUrl =
    meta.ogImage || (ctx.firstImage ? `${SITE.baseUrl}${ctx.firstImage}` : '');

  const html = renderArticlePage({
    title: meta.title,
    summary: meta.summary,
    slug,
    faq: meta.faq,
    contentHtml,
    ogImageUrl,
    publishedAt: times.publishedAt,
    lastEditedTime: times.editedTime,
    ctaUrl: meta.ctaUrl,
    ctaLabel: meta.ctaLabel,
  });
  fs.writeFileSync(path.join(srcDir, 'index.html'), html);
  pruneUnusedAssets(assetsDir);
  pruneUnusedSubPages(srcDir, ctx.emittedSubPages);
  // image = 목록 썸네일용 대표 이미지, subPages = 발행된 카드형 상세 페이지들
  return {image: ctx.firstImage || '', subPages: ctx.emittedSubPages};
}

// ---------- sitemap / robots / llms ----------
function mergeSitemap(articles) {
  const sp = path.join(DIST_DIR, 'sitemap.xml');
  const today = new Date().toISOString().split('T')[0];
  const urls = [
    {loc: `${SITE.baseUrl}/articles`, pr: '0.9'},
    ...articles.map(a => ({
      loc: `${SITE.baseUrl}/articles/${a.slug}`,
      pr: '0.8',
    })),
  ]
    .map(
      u =>
        `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>${u.pr}</priority></url>`,
    )
    .join('\n');
  let xml = readFileOr(sp, '');
  if (xml.includes('</urlset>')) {
    xml = xml.replace(
      /\s*<url>(?:(?!<\/url>)[\s\S])*?\/articles(?:\/[^<]*)?<\/loc>[\s\S]*?<\/url>/g,
      '',
    );
    xml = xml.replace('</urlset>', `${urls}\n</urlset>`);
  } else {
    xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
  }
  fs.writeFileSync(sp, xml);
  // 동일 내용의 새 파일명 사본. GSC가 기존 sitemap.xml에 "읽을 수 없음" 상태를
  // 캐싱했을 때, 이력 없는 새 URL로 제출하면 깨끗하게 재fetch된다.
  fs.writeFileSync(path.join(DIST_DIR, 'sitemap-v2.xml'), xml);
}
function writeRobots() {
  fs.writeFileSync(
    path.join(DIST_DIR, 'robots.txt'),
    `User-agent: *\nAllow: /\n\n# AI/answer engines (AEO/GEO)\nUser-agent: GPTBot\nAllow: /\nUser-agent: OAI-SearchBot\nAllow: /\nUser-agent: ChatGPT-User\nAllow: /\nUser-agent: ClaudeBot\nAllow: /\nUser-agent: PerplexityBot\nAllow: /\nUser-agent: Google-Extended\nAllow: /\n\nSitemap: ${SITE.baseUrl}/sitemap.xml\nSitemap: ${SITE.baseUrl}/sitemap-v2.xml\n`,
  );
}
function writeLlms(articles) {
  fs.writeFileSync(
    path.join(DIST_DIR, 'llms.txt'),
    `# ${SITE.name} — Articles\n\n> 이동약자를 위한 접근성 정보 콘텐츠.\n\n## Articles\n${articles.map(a => `- [${a.title}](${SITE.baseUrl}/articles/${a.slug}): ${a.summary || ''}`).join('\n')}\n`,
  );
}

// ---------- dist 재조립 (Notion 불필요: 커밋된 web-articles/ + manifest만 사용) ----------
/**
 * 목록 페이지는 매번 템플릿으로 다시 그리지만 **상세 페이지는 커밋된 HTML 복사**다.
 * 그래서 템플릿을 고쳐도 상세엔 반영되지 않고, 목록만 새것인 절름발이 배포가 나간다.
 * (2026-08: CTA 바 때 한 번, GA 계측 때 또 한 번 같은 함정에 빠졌다.)
 *
 * 지금 템플릿이 내는 상세 페이지의 필수 마커가 커밋된 HTML 에 없으면 크게 경고한다.
 * 판정 기준을 "계측 스크립트 태그" 로 두는 이유: head 에 있고, 재발행 없이는 절대 생기지 않는다.
 */
function warnIfDetailPagesAreStale() {
  const MARKER = '/articles-analytics.js';
  // 목록(DIST_ARTICLES/index.html)은 매번 다시 그리므로 제외하고 상세 페이지만 본다.
  // **중첩 상세(parent 있는 row 페이지)까지 전수 순회한다** — topLevel 만 검사하면
  // "부모는 재발행됐지만 자식은 옛 HTML" 인 변종을 조용히 통과시킨다.
  const detailPages = [];
  const walk = dir => {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (entry.name === 'index.html' && dir !== DIST_ARTICLES) {
        detailPages.push(p);
      }
    }
  };
  walk(DIST_ARTICLES);
  const stale = detailPages.filter(
    p => !fs.readFileSync(p, 'utf8').includes(MARKER),
  );
  if (stale.length === 0) return;
  const rel = p => path.relative(DIST_ARTICLES, path.dirname(p));
  console.warn(
    `\n⚠️  상세 페이지 ${stale.length}/${detailPages.length}건이 **옛 템플릿**으로 만들어져 있습니다.\n` +
      `   --offline 은 커밋된 HTML 을 복사만 하므로 템플릿 변경이 상세에 반영되지 않습니다.\n` +
      `   NOTION_TOKEN 을 주고 --offline 없이 재발행하세요 (/scc-web-articles-publish).\n` +
      `   예: ${stale.slice(0, 3).map(rel).join(', ')}\n`,
  );
}

function reassembleDist(manifest) {
  fs.mkdirSync(DIST_DIR, {recursive: true});
  rmrf(DIST_ARTICLES);
  fs.mkdirSync(DIST_ARTICLES, {recursive: true});
  // 공용 에셋(로고 등): web-articles/_assets → web-dist/articles/assets
  const sharedAssets = path.join(SRC_DIR, '_assets');
  if (fs.existsSync(sharedAssets))
    copyDir(sharedAssets, path.join(DIST_ARTICLES, 'assets'));
  // featured(숫자)가 있는 글이 1·2·3… 순으로 맨 위, 나머지는 createdTime 내림차순.
  const rank = a => (typeof a.featured === 'number' ? a.featured : Infinity);
  const pub = a => a.publishedAt || a.createdTime || '';
  const all = Object.values(manifest).sort(
    (a, b) => rank(a) - rank(b) || pub(b).localeCompare(pub(a)),
  );
  // 상세 페이지(parent 있음)는 부모 디렉토리에 중첩 → 부모 복사 시 함께 온다. 목록엔 top-level만.
  const topLevel = all.filter(a => !a.parent);
  for (const a of topLevel) {
    const src = path.join(SRC_DIR, a.slug);
    if (fs.existsSync(src)) copyDir(src, path.join(DIST_ARTICLES, a.slug));
  }
  fs.writeFileSync(
    path.join(DIST_ARTICLES, 'index.html'),
    renderListPage(topLevel),
  );
  warnIfDetailPagesAreStale();
  mergeSitemap(all); // 상세 페이지 URL도 sitemap에 포함(SEO)
  writeRobots();
  writeLlms(all);
  return all;
}

// ---------- main ----------
async function main() {
  fs.mkdirSync(SRC_DIR, {recursive: true});
  const manifest = readJson(MANIFEST_PATH, {});

  // offline: Notion 없이 커밋된 소스로 web-dist만 재조립 (yarn web:build에서 호출)
  if (OFFLINE) {
    // 썸네일은 커밋된 원본만 있으면 만들 수 있다 → offline 실행이 기존 발행분의 백필 수단이다.
    // 생성 건수가 아니라 manifest 변화로 판정한다: 썸네일 파일은 있는데 thumbnail 필드만 빠진
    // 상태(예: manifest만 되돌린 경우)도 여기서 복구돼야 한다.
    const before = JSON.stringify(manifest);
    await ensureThumbnails(manifest);
    if (JSON.stringify(manifest) !== before)
      fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
    const published = reassembleDist(manifest);
    console.log(
      `📴 offline 재조립: ${published.length}건 → web-dist/articles/`,
    );
    return;
  }

  // --rerender 는 캐시가 통째로 없을 때(새 클론 등)가 가장 흔한 실패다. 첫 DB 쿼리에서
  // raw 스택을 뱉지 말고 무엇을 해야 하는지 알려준다.
  if (
    RERENDER &&
    cacheRead('api', `POST databases/${DB_ID}/query {}`) === undefined
  ) {
    console.error(
      '❌ --rerender: 렌더 입력 캐시가 없습니다.\n' +
        `   캐시는 gitignore 라(${path.relative(ROOT, CACHE_DIR)}/) 새 클론에는 없습니다.\n` +
        '   NOTION_TOKEN 을 주고 --force 로 1회 받으면 캐시가 채워지고, 이후 템플릿 수정은\n' +
        '   --rerender 로 Notion 무접속·수십 초에 끝납니다.',
    );
    process.exit(1);
  }

  console.log(
    RERENDER ? '💾 캐시에서 렌더 입력 로드...' : '📥 Notion DB 쿼리...',
  );
  const allPages = await queryAllPages();
  // [WIP] 글은 파이프라인 진입 전에 걸러낸다. current에서도 빠지므로, 발행된 글에
  // 나중에 [WIP]를 붙이면 삭제 판정에 걸려 prod에서 내려간다.
  const wipPages = allPages.filter(p => isWip(plain(titleRichOf(p))));
  const pages = allPages.filter(p => !isWip(plain(titleRichOf(p))));
  if (wipPages.length) {
    console.log(`  ⏸️  [WIP] 제외 ${wipPages.length}건:`);
    for (const p of wipPages)
      console.log(`      - ${plain(titleRichOf(p)).trim()}`);
  }
  const current = new Set(pages.map(p => p.id));

  // 최초 발행 시각은 slug 기준으로 보존한다. 상세 페이지는 부모 재빌드 때 manifest
  // 엔트리가 지워졌다 다시 생기므로, 삭제 전에 여기서 스냅샷을 떠둬야 날짜가 안 밀린다.
  // Notion date는 분 단위로 절삭해 돌려주므로, 처음부터 분 단위로 찍어야
  // 다음 빌드에서 되읽은 값과 manifest/HTML이 어긋나지 않는다.
  const NOW_ISO = new Date().toISOString().replace(/:\d\d\.\d+Z$/, ':00.000Z');
  const prevPublished = {};
  for (const e of Object.values(manifest))
    if (e.slug && e.publishedAt) prevPublished[e.slug] = e.publishedAt;

  const rows = []; // {meta, times}
  const needsMeta = [];
  const newlyStamped = []; // DB에 publishedAt이 없어 이번에 찍은 글
  for (const page of pages) {
    const meta = resolveRow(page);
    // 본문 페이지의 시각(=incremental 기준). mention이면 타깃 페이지 조회.
    let createdTime = page.created_time;
    let editedTime = page.last_edited_time;
    if (meta.isMention) {
      const cp = await retrievePage(meta.contentPageId);
      createdTime = cp.created_time;
      editedTime = cp.last_edited_time;
    }
    if (!meta.slug || !meta.summary || !meta.categories.length) {
      const lack = [
        !meta.slug && 'slug',
        !meta.summary && 'summary',
        !meta.categories.length && 'category',
      ].filter(Boolean);
      needsMeta.push({meta, page, lack});
      continue;
    }
    // 경고만 하고 발행은 막지 않는다 — 오타 하나로 살아 있는 SEO 페이지를 내리는 게 더 나쁘다.
    // 잘못된 값은 '전체'에는 나오고 해당 칩으로만 안 걸린다(graceful).
    const unknown = meta.categories.filter(
      c => !CATEGORIES.some(x => x.name === c),
    );
    if (unknown.length)
      console.log(
        `  ⚠️ ${meta.slug}: 목록 칩에 없는 category ${unknown.join(', ')} — 그 카테고리로는 필터링되지 않는다`,
      );
    if (meta.categories.length > 2)
      console.log(
        `  ⚠️ ${meta.slug}: category ${meta.categories.length}개 — 1개 원칙, 정말 애매할 때만 2개다`,
      );
    // 최초 발행 시각: 한 번 정해지면 재빌드해도 안 바뀐다. datePublished(JSON-LD)·
    // 화면 표시 날짜·목록 정렬이 전부 이 값을 쓴다. 원본 노션 페이지의 created_time을
    // 쓰면 URL이 생기기도 전 날짜가 datePublished로 나가서 SEO상 맞지 않는다.
    // 우선순위: DB(source of truth) → manifest(캐시) → 지금(최초 발행).
    const publishedAt = meta.publishedAt || prevPublished[meta.slug] || NOW_ISO;
    if (!meta.publishedAt && !DRY) newlyStamped.push({meta, publishedAt});
    rows.push({meta, times: {createdTime, editedTime, publishedAt}});
  }
  // DB에 publishedAt이 비어 있던 글 = 이번이 최초 발행 → DB에 기록해 고정한다.
  for (const s of newlyStamped) {
    await stampPublishedAt(s.meta.rowId, s.publishedAt);
    console.log(
      `  🕒 최초 발행 시각 기록: ${s.meta.slug} → ${s.publishedAt.slice(0, 10)}`,
    );
  }

  const changed = rows.filter(r => {
    if (ONLY.length) return ONLY.includes(r.meta.slug);
    // --rerender 는 "템플릿이 바뀌었다"는 뜻이므로 --force 와 같이 전 페이지를 다시 찍는다.
    if (FORCE || RERENDER) return true;
    const prev = manifest[r.meta.rowId];
    return (
      !prev ||
      prev.editedTime !== r.times.editedTime ||
      prev.slug !== r.meta.slug
    );
  });
  if (ONLY.length) {
    const missing = ONLY.filter(s => !rows.some(r => r.meta.slug === s));
    if (missing.length)
      console.log(`  ⚠️ --only 에 DB에 없는 slug: ${missing.join(', ')}`);
  }
  // 상세 페이지(parent 있음)는 top-level DB에 없으니 삭제 판정에서 제외(부모 재빌드 시 재생성)
  const deleted = Object.keys(manifest).filter(
    id => !current.has(id) && !manifest[id].parent,
  );

  // 내부 링크 remap 테이블 + 카드형 상세 메타 로드
  SUBPAGES = readJson(SUBPAGES_PATH, {});
  LINK_MAP = {};
  CARD_BY_PATH = {};
  for (const {meta} of rows) {
    LINK_MAP[noHy(meta.contentPageId)] = `/articles/${meta.slug}`;
    CARD_BY_PATH[`/articles/${meta.slug}`] = {
      title: meta.title,
      desc: meta.summary,
      // 이미 다운로드된 대표 이미지(로컬 경로) 재사용 — bookmark 카드 썸네일용
      image: (manifest[meta.rowId] || {}).image || '',
    };
  }
  for (const [rid, sp] of Object.entries(SUBPAGES)) {
    LINK_MAP[noHy(rid)] = `/articles/${sp.parentSlug}/${sp.slug}`;
    CARD_BY_PATH[`/articles/${sp.parentSlug}/${sp.slug}`] = {
      title: sp.title,
      desc: sp.summary,
      image: '',
    };
  }

  console.log(
    `🔎 신규/변경 ${changed.length} · 삭제 ${deleted.length} · 메타미비(스킵) ${needsMeta.length} · 전체 ${pages.length}`,
  );

  // slug 가 바뀌면 (a) 기존 /articles/<old> 가 고아로 남고 (b) 그 slug 를 ad_group 으로
  // 발급한 CTA 트래킹링크의 유입 리포트가 끊긴다. 조용히 새로 빌드하면 아무도 모른다.
  // ponytail: 경고만 한다 — 옛 디렉토리를 자동 삭제하면 살아 있는 SEO 페이지가 사라진다
  const renamed = rows.filter(r => {
    const prev = manifest[r.meta.rowId];
    return prev && prev.slug && prev.slug !== r.meta.slug;
  });
  if (renamed.length)
    console.log(
      `   ⚠️ slug 변경 감지 — 메타 생성 시 기존 slug 를 덮어쓰지 않았는지 확인할 것:\n` +
        renamed
          .map(
            r =>
              `      - "${r.meta.title}": ${manifest[r.meta.rowId].slug} → ${r.meta.slug}\n` +
              `        · 옛 페이지 ${path.join(SRC_DIR, manifest[r.meta.rowId].slug)} 가 남는다 (수동 정리)\n` +
              `        · 트래킹링크(ad_group=옛 slug)의 유입 집계가 끊긴다`,
          )
          .join('\n'),
    );
  if (needsMeta.length)
    console.log(
      `   ⚠️ slug/summary/category 없는 문서(스킬 STEP 2에서 메타 생성·라이트백 필요):\n` +
        needsMeta
          .map(
            n =>
              `      - "${n.meta.title}" [누락: ${n.lack.join(', ')}] (rowId=${n.meta.rowId}, contentPageId=${n.meta.contentPageId})`,
          )
          .join('\n'),
    );

  if (DRY) {
    // 어떤 글이 왜 잡혔는지 안 찍으면 STEP 2 대상을 역추적하는 데 별도 스크립트가 필요하다
    if (changed.length)
      console.log(
        `   📝 신규/변경 문서:\n` +
          changed
            .map(c => {
              const prev = manifest[c.meta.rowId];
              const why = !prev
                ? '신규'
                : prev.slug !== c.meta.slug
                  ? `slug 변경 ${prev.slug} → ${c.meta.slug}`
                  : `수정 ${prev.editedTime} → ${c.times.editedTime}`;
              return `      - ${c.meta.slug}  (${c.meta.title})\n        ${why} · rowId=${c.meta.rowId}`;
            })
            .join('\n'),
      );
    if (deleted.length)
      console.log(
        `   🗑️  삭제 대상:\n` +
          deleted.map(id => `      - ${manifest[id].slug}`).join('\n'),
      );
    console.log('   (--dry: 파일 변경 없음)');
    return;
  }

  for (const id of deleted) {
    rmrf(path.join(SRC_DIR, manifest[id].slug));
    console.log(`  🗑️  삭제: ${manifest[id].slug}`);
    delete manifest[id];
  }
  for (const {meta, times} of changed) {
    // --rerender 사전 점검: 캐시가 없으면 **디렉토리를 건드리기 전에** 건너뛴다.
    // prepareArticleDir 가 index.html 을 먼저 지우므로, 렌더에 들어간 뒤 미스가 나면
    // 그 페이지가 빈 채로 남는다. 여기서 걸러야 커밋본이 보존된다.
    if (RERENDER && !hasRenderCache(meta.contentPageId)) {
      cacheMisses.push(meta.slug);
      continue;
    }
    console.log(`  🔧 생성: ${meta.slug}  (${meta.title})`);
    // 이 부모의 기존 상세 페이지 manifest 엔트리 제거 후 재생성(스테일 방지)
    for (const k of Object.keys(manifest))
      if (manifest[k].parent === meta.slug) delete manifest[k];
    const {image, subPages} = await buildArticle(meta, times);
    manifest[meta.rowId] = {
      slug: meta.slug,
      title: meta.title,
      summary: meta.summary,
      image, // 목록 썸네일용 대표 이미지
      createdTime: times.createdTime,
      publishedAt: times.publishedAt,
      editedTime: times.editedTime,
      contentPageId: meta.contentPageId,
    };
    for (const sp of subPages)
      manifest[sp.contentPageId] = {
        ...sp,
        publishedAt: prevPublished[sp.slug] || sp.publishedAt || NOW_ISO,
      };
    if (subPages.length) console.log(`     ↳ 상세 페이지 ${subPages.length}건`);
  }
  // featured/category/cta는 changed 루프 밖에서 매번 동기화한다. incremental 기준은 **본문 페이지**의
  // editedTime이라, DB row의 프로퍼티만 바꾸면 본문 시각이 그대로여서 재빌드가 안 걸린다.
  // (DB 쿼리는 이미 끝났으므로 추가 API 호출 0)
  //
  // ⚠️ ctaUrl/ctaLabel 은 목록이 아니라 **상세 HTML 안에** 렌더된다. reassembleDist 는 이미 빌드된
  // web-articles/<slug>/index.html 을 그대로 복사하므로, 여기서 manifest 를 맞춰도 화면은 안 바뀐다.
  // Notion 에서 CTA 만 고쳤을 때는 `--only <slug>` 또는 `--force` 로 다시 렌더해야 한다.
  // (manifest 에 넣는 이유는 감사/디버깅용 — 어느 글에 CTA 가 채워져 있는지 한눈에 보려고)
  for (const {meta} of rows)
    if (manifest[meta.rowId]) {
      manifest[meta.rowId].featured = meta.featured;
      manifest[meta.rowId].categories = meta.categories;
      manifest[meta.rowId].ctaUrl = meta.ctaUrl || '';
      manifest[meta.rowId].ctaLabel = meta.ctaLabel || '';
    }
  // 빌드 루프 + pruneUnusedAssets가 모두 끝난 뒤여야 한다 (prune이 방금 만든 썸네일을 지운다).
  await ensureThumbnails(manifest);
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');

  const published = reassembleDist(manifest);
  console.log(`✅ 완료: 발행 ${published.length}건 → web-dist/articles/`);
  // 조용히 넘어가면 "성공 로그만 보고 반영됐다고 착각"하는 --offline 함정이 그대로 재현된다.
  // 스킵된 글은 커밋된 HTML 이 그대로 남아 있어(= 템플릿 변경 미반영) 산출물 grep 이 어긋난다.
  if (cacheMisses.length) {
    console.log(
      `\n⚠️  --rerender 로 다시 찍지 못한 글 ${cacheMisses.length}건 (캐시 없음 — 커밋본 유지됨):\n` +
        cacheMisses.map(s => `      - ${s}`).join('\n') +
        `\n   템플릿 변경이 이 글들에는 **반영되지 않았습니다**. 다음 중 하나로 마무리하세요:\n` +
        `      NOTION_TOKEN=... node scripts/build-articles.js --db <id> --only ${cacheMisses.join(',')}\n` +
        `      NOTION_TOKEN=... node scripts/build-articles.js --db <id> --force   (전체, 캐시도 새로 채움)`,
    );
  }
}

if (require.main === module) {
  main().catch(e => {
    console.error('❌ build-articles 실패:', e);
    process.exit(1);
  });
} else {
  // 에셋 유실 회귀 테스트용 (scripts/__tests__/build-articles-assets.test.js)
  module.exports = {
    prepareArticleDir,
    pruneUnusedAssets,
    pruneUnusedSubPages,
    reuseExistingAsset,
    ensureThumbnails,
    THUMB_NAME,
    isImage,
    isHeif,
    // --rerender 캐시 레이어 (scripts/__tests__/build-articles-cache.test.js)
    cacheRead,
    cacheWrite,
    cacheFile,
    hasRenderCache,
    CACHE_DIR,
    CACHE_V,
  };
}
