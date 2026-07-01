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
async function api(method, p, body) {
  const res = await fetch(`https://api.notion.com/v1/${p}`, {
    method,
    headers: H,
    body: body ? JSON.stringify(body) : undefined,
  });
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
  const res = await fetch(url);
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
      let t = esc(r.plain_text);
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
      if (r.href) t = `<a href="${esc(r.href)}" rel="noopener">${t}</a>`;
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
// callout color는 배경 의미 (gray=회색 배경, blue_background=파랑 배경)
function calloutBgStyle(color) {
  const c = (color || '').replace('_background', '');
  return `background:${BG_COLOR[c] || 'var(--soft)'};`;
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

// 인라인 DB는 본문이 아니라 row 프로퍼티에 내용이 있다(식당/장소 카드). Notion 인라인
// 표 뷰처럼 프로퍼티를 표로 렌더(가로 스크롤). 값 없는 컬럼·title 공란은 자동 생략.
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
  // 공식 API는 인라인 뷰의 컬럼 순서를 주지 않는다 → COLUMN_ORDER로 Notion 뷰 순서를 수동 지정.
  // 매핑 없으면 스키마 순서(title 우선)로 폴백하고 경고(새 DB는 순서 확인 필요).
  const preferred = COLUMN_ORDER[dbId];
  let cols;
  if (preferred) {
    cols = preferred.filter(n => nonEmpty.includes(n));
    // 매핑에 빠졌지만 값이 있는 컬럼은 뒤에 덧붙여 데이터 유실 방지
    for (const n of nonEmpty) if (!cols.includes(n)) cols.push(n);
  } else {
    console.warn(
      `  ⚠️ child_database 컬럼 순서 미지정(${dbId} "${title}") — Notion 뷰 순서 확인 필요, 스키마 순서로 폴백`,
    );
    cols =
      titleName && nonEmpty.includes(titleName)
        ? [titleName, ...nonEmpty.filter(n => n !== titleName)]
        : nonEmpty;
  }
  if (!cols.length) return '';
  const head = `<tr>${cols.map(n => `<th>${esc(n)}</th>`).join('')}</tr>`;
  const body = rows
    .map(
      r =>
        `<tr>${cols.map(n => `<td>${renderPropValue(r.properties[n])}</td>`).join('')}</tr>`,
    )
    .join('');
  const cap = title ? `<figcaption>${esc(title)}</figcaption>` : '';
  return `<figure class="db"><div class="db-wrap"><table>${head}${body}</table></div>${cap}</figure>`;
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
    case 'paragraph':
      return d.rich_text.length
        ? `<p${colorStyle(d.color)}>${renderRich(d.rich_text)}</p>`
        : '';
    case 'heading_1':
      return `<h2${colorStyle(d.color)}>${renderRich(d.rich_text)}</h2>`;
    case 'heading_2':
      return `<h3${colorStyle(d.color)}>${renderRich(d.rich_text)}</h3>`;
    case 'heading_3':
      return `<h4${colorStyle(d.color)}>${renderRich(d.rich_text)}</h4>`;
    case 'to_do':
      return `<p><input type="checkbox" disabled ${d.checked ? 'checked' : ''}> ${renderRich(d.rich_text)}</p>`;
    case 'quote':
      return `<blockquote>${renderRich(d.rich_text)}${b.__children ? await renderBlocks(b.__children, ctx) : ''}</blockquote>`;
    case 'callout': {
      const emoji = d.icon && d.icon.type === 'emoji' ? d.icon.emoji : '💡';
      const inner = b.__children ? await renderBlocks(b.__children, ctx) : '';
      return `<aside class="callout" style="${calloutBgStyle(d.color)}"><span class="emoji">${esc(emoji)}</span><div>${renderRich(d.rich_text)}${inner}</div></aside>`;
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
      // 평탄화된 정적 페이지에선 의미 없음(앵커 점프 불가) → 생략
      return '';
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
  const ctx = {assetsDir, imgIdx: 0, firstImage: null, title: meta.title, slug};
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
  return ctx.firstImage || ''; // 목록 썸네일용 대표 이미지(루트절대경로)
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
  const published = Object.values(manifest).sort((a, b) =>
    (b.createdTime || '').localeCompare(a.createdTime || ''),
  );
  for (const a of published) {
    const src = path.join(SRC_DIR, a.slug);
    if (fs.existsSync(src)) copyDir(src, path.join(DIST_ARTICLES, a.slug));
  }
  fs.writeFileSync(
    path.join(DIST_ARTICLES, 'index.html'),
    renderListPage(published),
  );
  mergeSitemap(published);
  writeRobots();
  writeLlms(published);
  return published;
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
  const deleted = Object.keys(manifest).filter(id => !current.has(id));

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
    const image = await buildArticle(meta, times);
    manifest[meta.rowId] = {
      slug: meta.slug,
      title: meta.title,
      summary: meta.summary,
      image, // 목록 썸네일용 대표 이미지
      createdTime: times.createdTime,
      editedTime: times.editedTime,
      contentPageId: meta.contentPageId,
    };
  }
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');

  const published = reassembleDist(manifest);
  console.log(`✅ 완료: 발행 ${published.length}건 → web-dist/articles/`);
}

main().catch(e => {
  console.error('❌ build-articles 실패:', e);
  process.exit(1);
});
