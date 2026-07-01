/**
 * Article HTML template (self-contained, JS-free, SEO/AEO 최적)
 *
 * web.staircrusher.club/articles 정적 페이지. 타이포/색/간격은 Notion 퍼블리시 페이지
 * (staircrusherclub.notion.site)의 computed style을 그대로 맞춘다:
 *   본문 16px / line-height 1.5 / #2c2c2b, 볼드 600, 본문폭 720px,
 *   title 40px/700, H1 30px/600, H2 24px/600, H3 20px/600, 시스템 sans 폰트.
 * SPA(web/index.tsx → App.tsx)의 480px 모바일 프레임을 타지 않는 독립 HTML.
 */

const SITE = {
  baseUrl: 'https://web.staircrusher.club',
  name: '계단뿌셔클럽',
  appUrl: 'https://staircrusher.club',
  logo: 'https://web.staircrusher.club/articles/assets/scc-logo.png',
};

const FONT_STACK =
  'ui-sans-serif,-apple-system,"system-ui","Segoe UI Variable Display","Segoe UI",Helvetica,"Apple SD Gothic Neo","Apple Color Emoji",Arial,sans-serif';

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
const escapeAttr = escapeHtml;

// Notion 톤에 맞춘 CSS (디테일 페이지 + 목록 페이지 공용)
const BASE_CSS = `
:root{--fg:#2c2c2b;--muted:#787774;--line:#e9e9e7;--soft:#f7f6f3;}
*{box-sizing:border-box;}
html{-webkit-text-size-adjust:100%;}
body{margin:0;background:#fff;color:var(--fg);font-family:${FONT_STACK};font-size:16px;line-height:1.5;word-break:keep-all;}
.wrap{max-width:720px;margin:0 auto;padding:0 24px;}
a{color:inherit;}
img{max-width:100%;height:auto;}
/* top bar */
.site-header{border-bottom:1px solid var(--line);}
.site-header .wrap{display:flex;align-items:center;gap:8px;height:48px;}
.site-header img{width:24px;height:24px;border-radius:5px;}
.site-header b{font-size:15px;font-weight:600;}
.back{display:inline-flex;align-items:center;gap:5px;margin:22px 0 -6px;color:var(--muted);font-size:14px;text-decoration:none;}
.back:hover{color:var(--fg);}
/* article body — Notion 매칭 */
article{padding:8px 0 72px;}
h1.title{font-size:40px;font-weight:700;line-height:1.2;letter-spacing:-0.01em;margin:16px 0 6px;}
.article-date{color:var(--muted);font-size:14px;margin:0 0 26px;}
article h2{font-size:30px;font-weight:600;line-height:1.3;margin:34px 0 6px;}
article h3{font-size:24px;font-weight:600;line-height:1.3;margin:26px 0 4px;}
article h4{font-size:20px;font-weight:600;line-height:1.3;margin:20px 0 2px;}
article p{margin:0;padding:3px 0;}
article strong,article b{font-weight:600;}
article a{text-decoration:underline;text-decoration-color:rgba(44,44,43,.35);text-underline-offset:2px;}
article ul,article ol{margin:0;padding:2px 0 2px 1.7em;}
article li{padding:2px 0;}
article li::marker{color:var(--muted);}
blockquote{margin:8px 0;padding-left:14px;border-left:3px solid var(--fg);}
.callout{display:flex;gap:8px;background:var(--soft);border-radius:4px;padding:16px 16px 16px 12px;margin:8px 0;}
.callout .emoji{flex:0 0 auto;line-height:1.5;}
.callout>div>*:first-child{margin-top:0;padding-top:0;}
details{margin:3px 0;}
details summary{cursor:pointer;padding:3px 0;font-weight:600;}
pre{background:var(--soft);border-radius:4px;padding:16px;overflow:auto;font-size:14px;line-height:1.4;margin:8px 0;}
code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;}
:not(pre)>code{background:rgba(135,131,120,.15);color:#eb5757;padding:.2em .4em;border-radius:3px;font-size:.86em;}
hr{border:0;border-top:1px solid var(--line);margin:14px 0;}
figure{margin:10px 0;}
figure img{display:block;border-radius:3px;}
figcaption{color:var(--muted);font-size:14px;margin-top:6px;}
table{border-collapse:collapse;margin:8px 0;font-size:14px;width:100%;}
th,td{border:1px solid var(--line);padding:7px 9px;text-align:left;vertical-align:top;}
th{background:var(--soft);font-weight:600;}
.columns{display:flex;gap:16px;margin:8px 0;}
.columns>.column{flex:1 1 0;min-width:0;}
/* 인라인 DB(식당/장소 카드) → 가로 스크롤 표 + 컬러 pill */
figure.db{margin:12px 0;}
.db-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;border:1px solid var(--line);border-radius:6px;}
.db-wrap table{margin:0;border:0;min-width:100%;white-space:nowrap;}
.db-wrap th,.db-wrap td{border:0;border-bottom:1px solid var(--line);}
.db-wrap tr:last-child td{border-bottom:0;}
.pill{display:inline-block;padding:1px 8px;border-radius:4px;font-size:13px;line-height:1.6;}
/* 카드형 인라인 DB → 링크 카드 그리드(클릭 시 상세 페이지) */
.db-cards{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:4px 0;}
.db-card{display:flex;flex-direction:column;text-decoration:none;color:inherit;border:1px solid var(--line);border-radius:10px;overflow:hidden;}
.db-card:hover{border-color:#c8c8c4;}
.db-card-thumb{width:100%;aspect-ratio:16/10;object-fit:cover;background:var(--soft);}
.db-card-body{padding:12px 14px;}
.db-card-body b{font-size:15px;font-weight:600;}
.db-card-body p{margin:6px 0 0;color:var(--muted);font-size:13px;line-height:1.5;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;}
.db-wrap td a{text-decoration:underline;text-decoration-color:rgba(44,44,43,.35);}
.db-thumb{width:72px;height:54px;object-fit:cover;border-radius:4px;margin:1px;vertical-align:middle;}
/* 상세 페이지 상단 프로퍼티 요약 */
.db-detail-props{display:flex;flex-wrap:wrap;gap:8px 16px;margin:4px 0 14px;padding:12px 14px;background:var(--soft);border-radius:8px;font-size:14px;}
.db-detail-props .db-prop b{color:var(--muted);font-weight:600;margin-right:4px;}
/* 목차(TOC) */
nav.toc{margin:10px 0;padding:12px 16px;background:var(--soft);border-radius:8px;display:flex;flex-direction:column;gap:4px;}
nav.toc a{color:var(--fg);text-decoration:none;font-size:14px;}
nav.toc a:hover{text-decoration:underline;}
nav.toc .toc-l2{padding-left:0;}nav.toc .toc-l3{padding-left:14px;}nav.toc .toc-l1{padding-left:0;font-weight:600;}
/* heading 토글 */
details.htoggle>summary{list-style:none;cursor:pointer;}
details.htoggle>summary::-webkit-details-marker{display:none;}
details.htoggle>summary>*{display:inline;}
details.htoggle>summary::before{content:"▸ ";color:var(--muted);}
details.htoggle[open]>summary::before{content:"▾ ";}
:target{scroll-margin-top:60px;}
.tags{margin:36px 0 0;display:flex;flex-wrap:wrap;gap:8px;}
.tags span{background:var(--soft);color:var(--muted);border-radius:4px;padding:4px 10px;font-size:13px;}
.cta{margin:48px 0 0;padding:24px;background:var(--soft);border-radius:8px;text-align:center;}
.cta div{font-size:15px;}
.cta a{display:inline-block;background:#2c2c2b;color:#fff;padding:11px 22px;border-radius:6px;font-size:15px;font-weight:600;text-decoration:none;margin-top:12px;}
.site-footer{border-top:1px solid var(--line);color:var(--muted);font-size:13px;padding:22px 0;margin-top:48px;}
/* list page */
.list-title{font-size:34px;font-weight:700;margin:28px 0 4px;}
.list-sub{color:var(--muted);font-size:15px;margin:0 0 24px;}
.hero-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin:0 0 8px;}
.hero{display:block;text-decoration:none;color:inherit;}
.hero .thumb{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:10px;background:var(--soft);display:block;}
.hero h2{font-size:20px;font-weight:600;line-height:1.35;margin:14px 0 6px;}
.hero p{color:var(--muted);font-size:15px;line-height:1.55;margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.rest{list-style:none;padding:0;margin:8px 0 0;}
.rest li a{display:flex;gap:16px;align-items:center;padding:20px 0;border-top:1px solid var(--line);text-decoration:none;color:inherit;}
.rest .thumb{width:104px;height:104px;flex:0 0 104px;object-fit:cover;border-radius:8px;background:var(--soft);}
.rest h2{font-size:18px;font-weight:600;line-height:1.35;margin:0 0 6px;}
.rest p{color:var(--muted);font-size:14px;line-height:1.5;margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
@media (max-width:600px){
  h1.title{font-size:30px;}
  article h2{font-size:25px;}
  article h3{font-size:21px;}
  .columns{flex-direction:column;}
  .hero-grid{grid-template-columns:1fr;}
}
`;

function jsonLd(obj) {
  return `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;
}

function header() {
  return `<header class="site-header"><div class="wrap">
  <a href="/articles" style="display:flex;align-items:center;gap:8px;text-decoration:none;color:inherit;"><img src="/articles/assets/scc-logo.png" alt="${SITE.name}"><b>${SITE.name}</b></a>
</div></header>`;
}

function footerCta() {
  return `<section class="cta">
  <div>이동약자를 위한 진짜 접근성 정보, 계단뿌셔클럽에서 더 보기</div>
  <a href="${SITE.appUrl}">계단뿌셔클럽 바로가기</a>
</section>
<footer class="site-footer"><div class="wrap">© ${SITE.name}</div></footer>`;
}

function headCommon(title, desc, canonical, extra) {
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeAttr(desc)}">
<link rel="canonical" href="${canonical}">
${extra}
<style>${BASE_CSS}</style>`;
}

/**
 * 개별 아티클 페이지.
 * meta: { title, summary, slug, ogImageUrl, tags[], contentHtml, faq[{q,a}], createdTime, lastEditedTime }
 * 주의: summary(=리드 요약)는 본문에 그리지 않는다 (Notion 원본에 없음). meta/JSON-LD에만 사용.
 */
function renderArticlePage(meta) {
  const url = `${SITE.baseUrl}/articles/${meta.slug}`;
  const ogImage = meta.ogImageUrl || SITE.logo;
  const desc = meta.summary || '';

  const ld = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: meta.title,
      description: desc,
      image: ogImage ? [ogImage] : undefined,
      datePublished: meta.createdTime,
      dateModified: meta.lastEditedTime || meta.createdTime,
      mainEntityOfPage: {'@type': 'WebPage', '@id': url},
      author: {'@type': 'Organization', name: SITE.name, url: SITE.appUrl},
      publisher: {
        '@type': 'Organization',
        name: SITE.name,
        logo: {'@type': 'ImageObject', url: SITE.logo},
      },
    },
  ];
  if (Array.isArray(meta.faq) && meta.faq.length) {
    ld.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: meta.faq.map(f => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: {'@type': 'Answer', text: f.a},
      })),
    });
  }

  const tagsHtml =
    Array.isArray(meta.tags) && meta.tags.length
      ? `<div class="tags">${meta.tags.map(t => `<span>${escapeHtml(t)}</span>`).join('')}</div>`
      : '';
  const dateLabel = (meta.createdTime || '').slice(0, 10);

  const og = `<meta property="og:type" content="article">
<meta property="og:title" content="${escapeAttr(meta.title)}">
<meta property="og:description" content="${escapeAttr(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:site_name" content="${SITE.name}">
<meta property="og:image" content="${escapeAttr(ogImage)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeAttr(meta.title)}">
<meta name="twitter:description" content="${escapeAttr(desc)}">
<meta name="twitter:image" content="${escapeAttr(ogImage)}">
${ld.map(jsonLd).join('\n')}`;

  return `<!DOCTYPE html>
<html lang="ko">
<head>
${headCommon(`${meta.title} | ${SITE.name}`, desc, url, og)}
</head>
<body>
${header()}
<div class="wrap">
<a class="back" href="${meta.backHref || '/articles'}">← 목록으로</a>
<article data-testid="article-detail">
<h1 class="title">${escapeHtml(meta.title)}</h1>
<div class="article-date">${dateLabel}</div>
${meta.contentHtml}
${tagsHtml}
</article>
</div>
${footerCta()}
</body>
</html>`;
}

/**
 * /articles 목록 페이지.
 * articles: [{ slug, title, summary, image, createdTime }] (시간 역순 정렬은 호출측 책임)
 * 최근 2개는 큰 썸네일 히어로 카드, 나머지는 좌측 썸네일 리스트.
 */
function renderListPage(articles) {
  const url = `${SITE.baseUrl}/articles`;
  const thumb = a =>
    a.image
      ? `<img class="thumb" src="${escapeAttr(a.image)}" alt="${escapeAttr(a.title)}" loading="lazy">`
      : `<div class="thumb"></div>`;

  const heroes = articles.slice(0, 2);
  const rest = articles.slice(2);

  const heroHtml = heroes.length
    ? `<div class="hero-grid">${heroes
        .map(
          a => `<a class="hero" href="/articles/${a.slug}">
  ${thumb(a)}
  <h2>${escapeHtml(a.title)}</h2>
  <p>${escapeHtml(a.summary || '')}</p>
</a>`,
        )
        .join('\n')}</div>`
    : '';

  const restHtml = rest.length
    ? `<ul class="rest">${rest
        .map(
          a => `<li><a href="/articles/${a.slug}">
  ${thumb(a)}
  <div><h2>${escapeHtml(a.title)}</h2><p>${escapeHtml(a.summary || '')}</p></div>
</a></li>`,
        )
        .join('\n')}</ul>`
    : '';

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `아티클 | ${SITE.name}`,
    url,
    hasPart: articles.map(a => ({
      '@type': 'Article',
      headline: a.title,
      url: `${SITE.baseUrl}/articles/${a.slug}`,
    })),
  };

  return `<!DOCTYPE html>
<html lang="ko">
<head>
${headCommon(
  `아티클 | ${SITE.name}`,
  `이동약자를 위한 접근성 정보 콘텐츠 모음 - ${SITE.name}`,
  url,
  `<meta property="og:type" content="website">
<meta property="og:title" content="아티클 | ${SITE.name}">
<meta property="og:description" content="이동약자를 위한 접근성 정보 콘텐츠 모음">
<meta property="og:url" content="${url}">
<meta property="og:site_name" content="${SITE.name}">
${jsonLd(ld)}`,
)}
</head>
<body>
${header()}
<div class="wrap" data-testid="article-list">
<h1 class="list-title">아티클</h1>
<p class="list-sub">이동약자를 위한 진짜 접근성 정보</p>
${heroHtml}
${restHtml}
</div>
${footerCta()}
</body>
</html>`;
}

module.exports = {SITE, escapeHtml, renderArticlePage, renderListPage};
