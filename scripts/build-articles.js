#!/usr/bin/env node
/* eslint-env node */
/**
 * build-articles.js — Notion → web.staircrusher.club/articles 정적 생성기 (결정론적, incremental)
 *
 * 의존성 0: Notion REST API를 node 20 내장 fetch로 직접 호출한다 (package.json/앱 빌드 무관).
 *
 * - article-list DB를 쿼리. 각 row는 두 형태를 모두 지원:
 *     (1) row 제목이 다른 페이지 mention → 그 타깃 페이지가 본문 (link 형태)
 *     (2) row 자체에 본문 블록 → row가 곧 article
 * - incremental: **본문이 있는 페이지의 last_edited_time**을 manifest와 대조해 변경분만 처리.
 *   (메타 라이트백은 row를 건드리므로 mention 형태에선 시계 함정이 자연 회피됨)
 * - 본문(블록)→시맨틱 HTML 변환은 결정론적(LLM 토큰 0). callout/toggle/column/색상 보존.
 * - 메타데이터(slug/summary/ogImage/tags/faq)는 생성하지 않고 **DB row 프로퍼티에서 읽기만** 한다.
 *   (메타는 /scc-web-articles-publish 스킬에서 Claude가 생성해 row에 라이트백 해둠)
 *
 * 사용: NOTION_TOKEN=secret node scripts/build-articles.js --db <database_id> [--dry]
 */

const fs = require('fs');
const path = require('path');
const {SITE, renderArticlePage, renderListPage} = require('./article-template');

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
// offline: Notion 미사용. 레포에 커밋된 web-articles/(소스+manifest)로 web-dist만 재조립.
// → yarn web:build가 이걸 돌려, 앱 웹 배포 시에도 web-dist에 /articles가 항상 포함된다
//   (web-deploy.sh의 `sync --delete`가 /articles를 지우지 않게 하는 구조적 안전장치).
const OFFLINE = process.argv.includes('--offline');
if (!OFFLINE) {
  if (!TOKEN) {
    console.error(
      '❌ NOTION_TOKEN 환경변수가 필요합니다. (배포용 재조립만이면 --offline)',
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
async function api(method, p, body) {
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
function resolveRow(page) {
  const props = page.properties || {};
  let titleRich = [];
  for (const k of Object.keys(props)) {
    if (props[k].type === 'title') {
      titleRich = props[k].title;
      break;
    }
  }
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
  let ogImage = '';
  const og = props.ogImage;
  if (og) {
    if (og.type === 'url') ogImage = og.url || '';
    else if (og.type === 'files' && og.files[0])
      ogImage = og.files[0].file?.url || og.files[0].external?.url || '';
    else if (og.type === 'rich_text') ogImage = plain(og.rich_text);
  }
  const tags =
    props.tags && props.tags.type === 'multi_select'
      ? props.tags.multi_select.map(t => t.name)
      : [];
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
    tags,
    faq,
  };
}

// ---------- 이미지 다운로드 (presigned 만료 대응) ----------
async function downloadImage(url, destDir, idx) {
  fs.mkdirSync(destDir, {recursive: true});
  const res = await fetchWithTimeout(url, {}, 30000, 2);
  if (!res.ok) throw new Error(`image ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const ct = res.headers.get('content-type') || '';
  const ext = ct.includes('png')
    ? 'png'
    : ct.includes('webp')
      ? 'webp'
      : ct.includes('gif')
        ? 'gif'
        : ct.includes('svg')
          ? 'svg'
          : 'jpg';
  const name = `img-${idx}.${ext}`;
  fs.writeFileSync(path.join(destDir, name), buf);
  return `assets/${name}`;
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
const BG_COLOR = {
  gray: '#f1f1ef',
  brown: '#f3eeee',
  orange: '#fbecdd',
  yellow: '#fbf3db',
  green: '#eef3ed',
  blue: '#e7f3f8',
  purple: '#f6f3f9',
  pink: '#faf1f5',
  red: '#fdebec',
};
function renderRich(rich) {
  return (rich || [])
    .map(r => {
      let t = esc(r.plain_text).replace(/\n/g, '<br>'); // Notion shift+enter → 줄바꿈 보존
      const a = r.annotations || {};
      if (a.code) t = `<code>${t}</code>`;
      if (a.bold) t = `<strong>${t}</strong>`;
      if (a.italic) t = `<em>${t}</em>`;
      if (a.strikethrough) t = `<s>${t}</s>`;
      if (a.underline) t = `<u>${t}</u>`;
      if (a.color && a.color !== 'default') {
        if (a.color.endsWith('_background')) {
          const c = a.color.replace('_background', '');
          const bg = BG_COLOR[c] || c;
          t = `<span style="background:${bg};padding:.1em .2em;border-radius:3px;">${t}</span>`;
        } else {
          t = `<span style="color:${TEXT_COLOR[a.color] || a.color};">${t}</span>`;
        }
      }
      if (r.href)
        t = `<a href="${esc(fixHref(r.href))}" rel="noopener">${t}</a>`;
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
// callout color는 배경 의미 (gray=회색 배경, blue_background=파랑 배경, default=Notion 기본 회색)
function calloutBgStyle(color) {
  const c = (color || 'default').replace('_background', '');
  return `background:${BG_COLOR[c] || '#f1f1ef'};`;
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
        ? `<a href="${esc(prop.url)}" rel="noopener">${esc(prop.url)}</a>`
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
async function buildDetailPage(row, parentSlug, nonTitleProps, titleName) {
  const meta = SUBPAGES[row.id] || {};
  const rslug = meta.slug || noHy(row.id).slice(0, 20);
  const fullSlug = `${parentSlug}/${rslug}`;
  const titlePlain =
    plain((row.properties[titleName] || {}).title) || '(제목 없음)';
  const srcDir = path.join(SRC_DIR, parentSlug, rslug);
  const assetsDir = path.join(srcDir, 'assets');
  rmrf(srcDir);
  fs.mkdirSync(assetsDir, {recursive: true});
  const ctx = {
    assetsDir,
    imgIdx: 0,
    firstImage: null,
    title: titlePlain,
    slug: fullSlug,
    emittedSubPages: [],
    headings: [],
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
    tags: [],
    faq: [],
    contentHtml,
    ogImageUrl,
    createdTime: row.created_time,
    lastEditedTime: row.last_edited_time,
    backHref: `/articles/${parentSlug}`,
  });
  fs.writeFileSync(path.join(srcDir, 'index.html'), html);
  if (fs.readdirSync(assetsDir).length === 0) rmrf(assetsDir);
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
        const d = await buildDetailPage(r, ctx.slug, nonTitleProps, titleName);
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
      const cols = orderedCols(dbId, nonEmpty, titleName, true);
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
      return `<figure class="db">${dbTitle}<div class="db-wrap"><table>${head}${body}</table></div></figure>`;
    }

    // 그 외 본문 보유(주로 사진만) → 상세 페이지 안 만들고 표에 사진 컬럼 인라인(콘텐츠 유실 방지)
    if (rich && !haveMeta)
      console.warn(
        `  ⚠️ 리치 본문 DB인데 subpages 메타 없음(${dbId} "${title}") — 표+사진 인라인 폴백. 메타 생성 권장`,
      );
    const cols = orderedCols(dbId, nonEmpty, titleName, true);
    const head = `<tr>${cols.map(n => `<th>${esc(n)}</th>`).join('')}<th>사진</th></tr>`;
    let body = '';
    for (const r of rows) {
      const thumbs = await renderRowImages(r.__children, ctx);
      body += `<tr>${cols.map(n => `<td>${renderPropValue(r.properties[n])}</td>`).join('')}<td>${thumbs}</td></tr>`;
    }
    return `<figure class="db">${dbTitle}<div class="db-wrap"><table>${head}${body}</table></div></figure>`;
  }

  // 프로퍼티형 → 기존 표
  const cols = orderedCols(dbId, nonEmpty, titleName);
  if (!cols.length) return '';
  const head = `<tr>${cols.map(n => `<th>${esc(n)}</th>`).join('')}</tr>`;
  const body = rows
    .map(
      r =>
        `<tr>${cols.map(n => `<td>${renderPropValue(r.properties[n])}</td>`).join('')}</tr>`,
    )
    .join('');
  return `<figure class="db">${dbTitle}<div class="db-wrap"><table>${head}${body}</table></div></figure>`;
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
      return `<figure><img src="${esc(src)}" alt="${esc(plain(d.caption) || ctx.title)}" loading="lazy">${cap ? `<figcaption>${cap}</figcaption>` : ''}</figure>`;
    }
    case 'bookmark':
    case 'embed': {
      const url = d.url || '';
      return url
        ? `<p><a href="${esc(url)}" rel="noopener">${esc(url)}</a></p>`
        : '';
    }
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
      return `<table>${body}</table>`;
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
        ? `<p><a href="${esc(url)}" rel="noopener">${esc(t)}: ${esc(url)}</a></p>`
        : '';
    }
    default:
      if (d.rich_text) return `<p>${renderRich(d.rich_text)}</p>`;
      console.warn(`  ⚠️ 미지원 블록(스킵): ${t}`);
      return '';
  }
}

// ---------- 한 article 생성 ----------
async function buildArticle(meta, times) {
  const slug = meta.slug;
  const srcDir = path.join(SRC_DIR, slug);
  const assetsDir = path.join(srcDir, 'assets');
  rmrf(srcDir);
  fs.mkdirSync(assetsDir, {recursive: true});

  const blocks = await fetchChildren(meta.contentPageId);
  const ctx = {
    assetsDir,
    imgIdx: 0,
    firstImage: null,
    title: meta.title,
    slug,
    emittedSubPages: [], // 카드형 DB row들의 상세 페이지(부모 렌더 중 발행)
    headings: [],
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
    tags: meta.tags,
    faq: meta.faq,
    contentHtml,
    ogImageUrl,
    createdTime: times.createdTime,
    lastEditedTime: times.editedTime,
  });
  fs.writeFileSync(path.join(srcDir, 'index.html'), html);
  if (fs.readdirSync(assetsDir).length === 0) rmrf(assetsDir);
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
function reassembleDist(manifest) {
  fs.mkdirSync(DIST_DIR, {recursive: true});
  rmrf(DIST_ARTICLES);
  fs.mkdirSync(DIST_ARTICLES, {recursive: true});
  // 공용 에셋(로고 등): web-articles/_assets → web-dist/articles/assets
  const sharedAssets = path.join(SRC_DIR, '_assets');
  if (fs.existsSync(sharedAssets))
    copyDir(sharedAssets, path.join(DIST_ARTICLES, 'assets'));
  const all = Object.values(manifest).sort((a, b) =>
    (b.createdTime || '').localeCompare(a.createdTime || ''),
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
    const published = reassembleDist(manifest);
    console.log(
      `📴 offline 재조립: ${published.length}건 → web-dist/articles/`,
    );
    return;
  }

  console.log('📥 Notion DB 쿼리...');
  const pages = await queryAllPages();
  const current = new Set(pages.map(p => p.id));

  const rows = []; // {meta, times}
  const needsMeta = [];
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
    if (!meta.slug || !meta.summary) {
      needsMeta.push({meta, page});
      continue;
    }
    rows.push({meta, times: {createdTime, editedTime}});
  }

  const changed = rows.filter(r => {
    if (FORCE) return true;
    const prev = manifest[r.meta.rowId];
    return (
      !prev ||
      prev.editedTime !== r.times.editedTime ||
      prev.slug !== r.meta.slug
    );
  });
  // 상세 페이지(parent 있음)는 top-level DB에 없으니 삭제 판정에서 제외(부모 재빌드 시 재생성)
  const deleted = Object.keys(manifest).filter(
    id => !current.has(id) && !manifest[id].parent,
  );

  // 내부 링크 remap 테이블 + 카드형 상세 메타 로드
  SUBPAGES = readJson(SUBPAGES_PATH, {});
  LINK_MAP = {};
  for (const {meta} of rows)
    LINK_MAP[noHy(meta.contentPageId)] = `/articles/${meta.slug}`;
  for (const [rid, sp] of Object.entries(SUBPAGES))
    LINK_MAP[noHy(rid)] = `/articles/${sp.parentSlug}/${sp.slug}`;

  console.log(
    `🔎 신규/변경 ${changed.length} · 삭제 ${deleted.length} · 메타미비(스킵) ${needsMeta.length} · 전체 ${pages.length}`,
  );
  if (needsMeta.length)
    console.log(
      `   ⚠️ slug/summary 없는 문서(스킬 STEP 2에서 메타 생성·라이트백 필요):\n` +
        needsMeta
          .map(
            n =>
              `      - "${n.meta.title}" (rowId=${n.meta.rowId}, contentPageId=${n.meta.contentPageId})`,
          )
          .join('\n'),
    );

  if (DRY) {
    console.log('   (--dry: 변경 없음)');
    return;
  }

  for (const id of deleted) {
    rmrf(path.join(SRC_DIR, manifest[id].slug));
    console.log(`  🗑️  삭제: ${manifest[id].slug}`);
    delete manifest[id];
  }
  for (const {meta, times} of changed) {
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
      editedTime: times.editedTime,
      contentPageId: meta.contentPageId,
    };
    for (const sp of subPages) manifest[sp.contentPageId] = sp;
    if (subPages.length) console.log(`     ↳ 상세 페이지 ${subPages.length}건`);
  }
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');

  const published = reassembleDist(manifest);
  console.log(`✅ 완료: 발행 ${published.length}건 → web-dist/articles/`);
}

main().catch(e => {
  console.error('❌ build-articles 실패:', e);
  process.exit(1);
});
