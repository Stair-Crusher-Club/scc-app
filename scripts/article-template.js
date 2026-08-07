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

// SPA(web/index.html)와 동일한 GA4 속성. 이 셸은 SPA index.html을 안 타므로 여기에도 넣어야
// /articles 조회수가 집계된다.
const GA_ID = 'G-B80XR4HWJE';
const GA_SNIPPET = `<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');</script>`;

// 목록 페이지 카테고리 칩. **이 배열이 노출 순서의 유일한 정의**(Figma 72:363 순서).
// Notion DB `category`(multi_select) 옵션과 문자열이 정확히 일치해야 필터가 동작한다.
const CATEGORIES = [
  '맛집/카페',
  '공연/행사',
  '문화공간',
  '여행/나들이',
  '이동/교통',
];

// 푸터 외부 링크. Figma엔 URL이 없어 실서비스(staircrusher.club) 푸터와 레포에서 실측한 값.
// 필 3개는 airbridge 트래킹링크(channel=articles, campaign=articles_footer). 관리 시트에 기록됨.
// 목적지: app→staircrusher.club/app(딥링크 stair-crusher://), kakao→pf.kakao.com/_xdZMIG,
//        letter→staircrusherclub.stibee.com
const FOOTER = {
  appDownload: 'https://link.staircrusher.club/articles_footer_app',
  kakao: 'https://link.staircrusher.club/articles_footer_kakao',
  newsletter: 'https://link.staircrusher.club/articles_footer_letter',
  terms: 'https://agnica.notion.site/07acba336959451fbdddcbd26e8d49b0',
  privacy: 'https://agnica.notion.site/?pvs=143',
  biz: '사업자등록번호 623-82-00565 &nbsp;|&nbsp; 대표 : 박수빈, 이대호 &nbsp;|&nbsp; 서울특별시 강남구 역삼로 172 마루360 5층',
};

const PRETENDARD_CDN =
  'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css';

const FONT_STACK =
  '"Pretendard",ui-sans-serif,-apple-system,"system-ui","Segoe UI Variable Display","Segoe UI",Helvetica,"Apple SD Gothic Neo","Apple Color Emoji",Arial,sans-serif';

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
:root{--fg:#2c2c2b;--muted:#787774;--line:#e9e9e7;--soft:#f7f6f3;
/* 목록/푸터 디자인 토큰 (Figma) */
--g90:#16181c;--g80:#24262b;--g60:#585a64;--g25:#d8d8df;--g15:#f2f2f5;--g10:#f7f8fa;--blue:#0c76f7;}
*{box-sizing:border-box;}
[hidden]{display:none!important;}
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
/* 링크 텍스트가 생 URL이면 끊길 곳이 없어 페이지 전체가 가로로 늘어난다 */
article a{text-decoration:underline;text-decoration-color:rgba(44,44,43,.35);text-underline-offset:2px;overflow-wrap:anywhere;}
article ul,article ol{margin:0;padding:2px 0 2px 1.7em;}
article li{padding:2px 0;}
article li::marker{color:var(--muted);}
blockquote{margin:8px 0;padding-left:14px;border-left:3px solid var(--fg);}
.callout{display:flex;gap:8px;background:var(--soft);border-radius:4px;padding:16px 16px 16px 12px;margin:8px 0;}
.callout .emoji{flex:0 0 auto;line-height:1.5;}
.callout .callout-ico{flex:0 0 auto;width:22px;height:22px;margin-top:2px;object-fit:contain;}
/* flex 아이템 기본 min-width:auto 때문에 내부 nowrap(북마크 카드 URL 등)이 페이지를 밀어낸다 */
.callout>div{min-width:0;flex:1 1 auto;}
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
.tbl-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;}
.columns{display:flex;gap:16px;margin:8px 0;}
.columns>.column{flex:1 1 0;min-width:0;}
/* 인라인 DB(식당/장소 카드) → 가로 스크롤 표 + 컬러 pill */
figure.db{margin:12px 0;}
.db-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;border:1px solid var(--line);border-radius:6px;}
.db-wrap table{margin:0;border:0;min-width:100%;table-layout:auto;}
.db-wrap th,.db-wrap td{border:0;border-bottom:1px solid var(--line);white-space:normal;word-break:keep-all;overflow-wrap:anywhere;min-width:8em;max-width:24em;}
.db-title{font-weight:600;font-size:15px;margin:14px 0 6px;}
.empty{height:1em;margin:0;}
.db-wrap tr:last-child td{border-bottom:0;}
.pill{display:inline-block;padding:1px 8px;border-radius:4px;font-size:13px;line-height:1.6;}
/* bookmark 블록 → Notion 북마크 카드(좌 썸네일 + 우 제목/설명/URL). 치수는 Notion 실측 */
a.bookmark{display:flex;flex-wrap:wrap;align-items:stretch;margin:8px 0;border:1px solid var(--line);border-radius:10px;overflow:hidden;text-decoration:none;color:inherit;}
a.bookmark:hover{background:rgba(55,53,47,.03);}
.bm-thumb{flex:1 1 100px;min-width:0;height:154px;overflow:hidden;}
.bm-thumb img{display:block;width:100%;height:100%;object-fit:cover;}
.bm-body{flex:4 1 180px;min-width:0;display:flex;flex-direction:column;gap:8px;padding:18px 24px 14px;overflow:hidden;}
a.bookmark.no-thumb .bm-body{padding:12px 16px;}
.bm-title{font-size:17px;line-height:22px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.bm-desc{font-size:13px;line-height:18px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.bm-url{margin-top:auto;color:var(--muted);font-size:13px;line-height:18px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
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
/* ===== 사이트 푸터 (목록/상세 공용) ===== */
/* PC/MO가 Figma에서 auto-layout 값이 다르다(108:700 vs 108:859) — 같다고 가정하지 말 것 */
.site-footer{background:#27272a;padding:60px 0 100px;margin-top:80px;}
.site-footer .lwrap{display:flex;flex-direction:column;gap:50px;}
.f-top{display:flex;flex-direction:column;gap:20px;}
.f-brand{display:flex;flex-direction:column;gap:12px;align-items:flex-start;}
.f-tagline{color:#fff;font-size:14px;font-weight:600;line-height:1.5;letter-spacing:-0.28px;margin:0;}
.f-logo{display:block;width:208px;height:35px;max-width:100%;}
.f-pills{display:flex;flex-wrap:wrap;gap:12px;}
.f-pills a{display:inline-flex;align-items:center;gap:4px;background:rgba(255,255,255,.05);border-radius:78px;padding:8px 12px 8px 11px;color:rgba(255,255,255,.6);font-size:12px;font-weight:500;line-height:1.4;letter-spacing:-0.24px;text-decoration:none;}
.f-pills a:hover{background:rgba(255,255,255,.1);}
.f-pills img{display:block;width:20px;height:20px;}
.f-bottom{display:flex;flex-direction:column;gap:20px;color:#c1c1c5;font-size:13px;}
.f-legalgroup{display:flex;flex-direction:column;gap:16px;}
.f-legal{display:flex;flex-direction:column;gap:4px;}
.f-legal p{margin:0;}
.f-copy{font-weight:600;line-height:1.3;}
.f-biz{font-weight:400;line-height:1.5;}
.f-links{display:flex;gap:20px;}
.f-links a{color:#c1c1c5;line-height:1.3;text-decoration:underline;}
/* 파트너 로고 3개는 한 장의 partners.svg(288x24)를 스프라이트로 잘라 각각 링크로 만든다.
   좌표는 Figma Layer_1(108:1812) 자식 그룹 실측: 0/100, 124/61, 207/80 */
.f-partners{display:flex;align-items:flex-start;height:24px;}
.f-partners a{display:block;background-image:url(/articles/assets/partners.svg);background-repeat:no-repeat;background-size:288px 24px;}
.f-partners .p-acrc{width:100px;height:24px;background-position:0 0;margin-right:24px;}
.f-partners .p-nts{width:61px;height:24px;background-position:-124px 0;margin-right:22px;}
.f-partners .p-seoul{width:80px;height:22px;background-position:-207px 0;}
/* ===== 목록 페이지 ===== */
/* 상세 본문(.wrap 720/24, Notion 매칭)과 달리 목록은 Figma 기준 content 690 / MO 350 */
.lwrap{max-width:730px;margin:0 auto;padding:0 20px;}
/* padding-top만 — shorthand를 쓰면 .lwrap의 좌우 20px 패딩까지 덮어써서 모바일이 full-bleed 된다 */
.list-page{padding-top:40px;}
.list-head h1{font-size:28px;line-height:38px;font-weight:700;color:var(--g90);margin:0;}
.list-head p{font-size:15px;line-height:22px;letter-spacing:-0.3px;color:var(--g60);margin:4px 0 0;}
/* 칩 줄(532px)이 모바일 폭을 넘으므로 여기서 가로 스크롤을 흡수한다. 안 하면 페이지가 통째로 가로로 밀린다 */
.cat-tabs{display:flex;gap:8px;margin:32px -20px 0;padding:0 20px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;}
.cat-tabs::-webkit-scrollbar{display:none;}
.cat{flex:0 0 auto;appearance:none;-webkit-appearance:none;border:0;cursor:pointer;font-family:inherit;background:var(--g15);color:var(--g60);font-size:15px;line-height:22px;font-weight:500;letter-spacing:-0.3px;padding:6px 14px;border-radius:100px;}
.cat[aria-pressed="true"]{background:var(--g80);color:var(--g10);font-weight:600;}
.arts{margin:32px 0 0;}
.thumb{display:block;object-fit:cover;border-radius:4px;background:var(--g15);}
.c-title{font-size:20px;line-height:28px;font-weight:600;letter-spacing:-0.4px;color:#000;margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.c-meta{display:flex;gap:6px;align-items:center;color:var(--g60);font-size:13px;line-height:18px;letter-spacing:-0.26px;}
.c-meta b{font-weight:500;}
.c-meta i{flex:0 0 auto;width:2px;height:2px;border-radius:50%;background:currentColor;}
.feat{display:flex;gap:30px;align-items:center;text-decoration:none;color:inherit;}
.feat .thumb{flex:0 0 330px;width:330px;height:186px;}
.feat-body{display:flex;flex-direction:column;gap:16px;min-width:0;}
.feat-head{display:flex;flex-direction:column;gap:6px;min-width:0;}
.badge{color:var(--blue);font-size:13px;line-height:18px;font-weight:700;letter-spacing:-0.26px;}
.excerpt{color:var(--g90);font-size:15px;line-height:24px;letter-spacing:-0.3px;margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.feat-sep{border:0;border-top:1px solid var(--g25);margin:32px 0;}
.cards{display:grid;grid-template-columns:1fr 1fr;column-gap:30px;row-gap:32px;}
.card{display:flex;flex-direction:column;gap:12px;text-decoration:none;color:inherit;min-width:0;}
.card .thumb{width:100%;aspect-ratio:330/186;}
.card-body{display:flex;flex-direction:column;gap:6px;min-width:0;}
.cat-empty{color:var(--g60);font-size:15px;margin:40px 0 0;text-align:center;}
.more-wrap{display:flex;justify-content:center;margin:40px 0 0;}
.more{appearance:none;-webkit-appearance:none;border:0;cursor:pointer;font-family:inherit;background:var(--g15);color:var(--g80);font-size:16px;line-height:24px;font-weight:500;letter-spacing:-0.32px;padding:12px 28px;border-radius:8px;}
@media (max-width:700px){
  h1.title{font-size:30px;}
  article h2{font-size:25px;}
  article h3{font-size:21px;}
  .columns{flex-direction:column;}
  .list-page{padding-top:30px;}
  .list-head h1{font-size:24px;line-height:32px;}
  .list-head p{font-size:14px;line-height:20px;letter-spacing:-0.28px;}
  .arts{margin-top:24px;}
  .feat{flex-direction:column;align-items:stretch;gap:12px;}
  .feat .thumb{flex:none;width:100%;height:auto;aspect-ratio:350/197;}
  .feat-body{gap:12px;}
  .feat-sep{margin:28px 0;}
  .cards{grid-template-columns:1fr;row-gap:28px;}
  .card .thumb{aspect-ratio:350/197;}
  /* 푸터는 MO auto-layout(108:859)이 PC(108:700)와 달라서 값을 되돌린다.
     padding-bottom 은 get_design_context 가 100 이라 답하지만 프레임 실측/픽셀 실측 모두 80 */
  .site-footer{margin-top:50px;padding-bottom:80px;}
  .site-footer .lwrap{gap:80px;padding:0 16px;}
  .f-bottom{gap:16px;}
  .f-legalgroup{display:contents;}
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

const partner = (href, cls, label) =>
  `<a class="${cls}" href="${href}" target="_blank" rel="noopener noreferrer" aria-label="${label}"></a>`;

const pill = (href, icon, label) =>
  `<a href="${href}" target="_blank" rel="noopener noreferrer"><img src="/articles/assets/${icon}" alt="" width="20" height="20">${label}</a>`;

// 목록/상세 공용 다크 푸터 (Figma 108:859)
function siteFooter() {
  return `<footer class="site-footer"><div class="lwrap">
<div class="f-top">
  <div class="f-brand">
    <p class="f-tagline">이동약자와 그 친구들의 막힘없는 이동</p>
    <img class="f-logo" src="/articles/assets/scc-wordmark-white.svg" alt="${SITE.name}" width="208" height="35">
  </div>
  <div class="f-pills">
    ${pill(FOOTER.appDownload, 'ic-download.svg', '앱 다운로드')}
    ${pill(FOOTER.kakao, 'ic-kakao.svg', '카카오톡')}
    ${pill(FOOTER.newsletter, 'ic-mail.svg', '뿌클레터')}
  </div>
</div>
<div class="f-bottom">
  <div class="f-legalgroup">
  <div class="f-legal">
    <p class="f-copy">Copyright ⓒ ${SITE.name}. All Rights Reserved</p>
    <p class="f-biz">${FOOTER.biz}</p>
  </div>
  <div class="f-links">
    <a href="${FOOTER.terms}" target="_blank" rel="noopener noreferrer">서비스 이용약관</a>
    <a href="${FOOTER.privacy}" target="_blank" rel="noopener noreferrer">개인정보 처리방침</a>
  </div>
  </div>
  <div class="f-partners">
    ${partner('https://www.acrc.go.kr/', 'p-acrc', '국민권익위원회')}
    ${partner('https://www.nts.go.kr/nts/main.do', 'p-nts', '국세청')}
    ${partner('https://www.seoul.go.kr/main/index.jsp', 'p-seoul', '서울특별시')}
  </div>
</div>
</div></footer>`;
}

function headCommon(title, desc, canonical, extra) {
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeAttr(desc)}">
<link rel="canonical" href="${canonical}">
${GA_SNIPPET}

<link rel="stylesheet" as="style" crossorigin href="${PRETENDARD_CDN}">
${extra}
<style>${BASE_CSS}</style>`;
}

/**
 * 개별 아티클 페이지.
 * meta: { title, summary, slug, ogImageUrl, contentHtml, faq[{q,a}], publishedAt, lastEditedTime }
 * 하단 태그 칩 · CTA 박스는 제거됨(2026-08 요청) — 본문 다음 바로 푸터다.
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
      datePublished: meta.publishedAt,
      dateModified: meta.lastEditedTime || meta.publishedAt,
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

  const dateLabel = (meta.publishedAt || '').slice(0, 10);

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
</article>
</div>
${siteFooter()}
</body>
</html>`;
}

// 초기 노출 개수: 새로운 글 1 + 카드 12 = 13 (Figma anno_4). 더보기 1회당 +6.
const PAGE_SIZE = 12;
const PAGE_STEP = 6;

// 목록 필터 + 더보기. 서버를 더 부르지 않고 전 글을 DOM에 그려둔 뒤 노출만 토글한다
// (크롤러는 전 글 링크를 그대로 본다). 초기 HTML 상태 = render()의 첫 결과라 깜빡임이 없다.
const LIST_JS = `<script>
(function(){
  var all=[].slice.call(document.querySelectorAll('.card'));
  if(!all.length) return;
  var tabs=[].slice.call(document.querySelectorAll('.cat'));
  var feat=document.querySelector('.feat'), sep=document.querySelector('.feat-sep');
  var moreWrap=document.querySelector('.more-wrap'), more=document.querySelector('.more');
  var empty=document.querySelector('.cat-empty');
  var cat='', limit=${PAGE_SIZE};
  function matching(){
    return all.filter(function(c){
      // 전체: 새로운 글 카드는 상단 히어로로 이미 보이므로 그리드에선 뺀다
      return cat ? c.dataset.cat.split('|').indexOf(cat)>=0 : !c.dataset.dup;
    });
  }
  function render(){
    var list=matching();
    all.forEach(function(c){c.hidden=true;});
    list.slice(0,limit).forEach(function(c){c.hidden=false;});
    if(feat) feat.hidden=!!cat;
    if(sep) sep.hidden=!!cat;
    if(moreWrap) moreWrap.hidden=list.length<=limit;
    if(empty) empty.hidden=list.length>0;
  }
  tabs.forEach(function(t){
    t.addEventListener('click',function(){
      cat=t.dataset.cat||''; limit=${PAGE_SIZE};
      tabs.forEach(function(x){x.setAttribute('aria-pressed', x===t?'true':'false');});
      render();
      });
  });
  if(more) more.addEventListener('click',function(){limit+=${PAGE_STEP};render();});
  render();
})();
</script>`;

const fmtDate = iso => (iso || '').slice(0, 10).replace(/-/g, '.');

/**
 * /articles 목록 페이지 (Figma 108:858 / 108:916).
 * articles: [{ slug, title, summary, image, publishedAt, categories[] }] (정렬은 호출측 책임)
 * articles[0] = "새로운 글" 히어로 카드. 카테고리 필터 시엔 히어로가 숨고 같은 글이
 * 그리드의 일반 카드(data-dup)로 나타난다 — 그래서 [0]은 두 군데 렌더된다.
 */
function renderListPage(articles) {
  const url = `${SITE.baseUrl}/articles`;
  // 목록은 압축 썸네일(thumb-0.webp)을 쓴다. 원본 image는 3~7MB짜리라 목록에 그대로 나가면 안 된다.
  // (상세 페이지 히어로/OG는 계속 원본 image — 거긴 고해상도가 맞다)
  const thumb = a => {
    const src = a.thumbnail || a.image;
    return src
      ? `<img class="thumb" src="${escapeAttr(src)}" alt="${escapeAttr(a.title)}" loading="lazy">`
      : `<div class="thumb"></div>`;
  };
  const catAttr = a => escapeAttr((a.categories || []).join('|'));
  const meta = a =>
    `<div class="c-meta"><b>${SITE.name}</b><i></i>${fmtDate(a.publishedAt)}</div>`;

  const top = articles[0];
  const featHtml = top
    ? `<a class="feat" href="/articles/${top.slug}" data-cat="${catAttr(top)}">
  ${thumb(top)}
  <div class="feat-body">
    <div class="feat-head">
      <div class="badge">새로운 글!</div>
      <h2 class="c-title">${escapeHtml(top.title)}</h2>
      ${meta(top)}
    </div>
    <p class="excerpt">${escapeHtml(top.summary || '')}</p>
  </div>
</a>
<hr class="feat-sep">`
    : '';

  const cardsHtml = `<div class="cards">${articles
    .map(
      (
        a,
        i,
      ) => `<a class="card" href="/articles/${a.slug}" data-cat="${catAttr(a)}"${
        i === 0 ? ' data-dup="1"' : ''
      }${i === 0 || i > PAGE_SIZE ? ' hidden' : ''}>
  ${thumb(a)}
  <div class="card-body"><h2 class="c-title">${escapeHtml(a.title)}</h2>${meta(a)}</div>
</a>`,
    )
    .join('\n')}</div>`;

  const tabsHtml = `<div class="cat-tabs">
<button type="button" class="cat" data-cat="" aria-pressed="true">전체</button>
${CATEGORIES.map(
  c =>
    `<button type="button" class="cat" data-cat="${escapeAttr(c)}" aria-pressed="false">${escapeHtml(c)}</button>`,
).join('\n')}
</div>`;

  const emptyHtml =
    '<p class="cat-empty" hidden>이 카테고리에 아직 글이 없어요.</p>';

  const moreHtml = `<div class="more-wrap"${
    articles.length - 1 <= PAGE_SIZE ? ' hidden' : ''
  }><button type="button" class="more">더 보기</button></div>`;

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
<noscript><style>.cat-tabs,.more-wrap{display:none}.cards .card[hidden]:not([data-dup]){display:flex!important}</style></noscript>
</head>
<body>
${header()}
<div class="lwrap list-page" data-testid="article-list">
<div class="list-head">
<h1>휠체어로, 여기 어때?</h1>
<p>이동약자를 위한 진짜 접근성 정보</p>
</div>
${tabsHtml}
<div class="arts">
${featHtml}
${cardsHtml}
${emptyHtml}
</div>
${moreHtml}
</div>
${siteFooter()}
${LIST_JS}
</body>
</html>`;
}

module.exports = {
  SITE,
  CATEGORIES,
  escapeHtml,
  renderArticlePage,
  renderListPage,
};
