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
// name: Notion DB `category`(multi_select) 옵션과 문자열이 정확히 일치해야 필터가 동작한다.
// slug: `/articles?category=<slug>` URL 용 ASCII 키. 이름에 한글과 `/`(맛집/카페)가 있어
//       그대로 쓰면 percent-encoding 범벅이 되고, data-cat 의 `|` 구분자와도 부딪힐 수 있다.
const CATEGORIES = [
  {name: '맛집/카페', slug: 'food'},
  {name: '공연/행사', slug: 'show'},
  {name: '문화공간', slug: 'culture'},
  {name: '여행/나들이', slug: 'travel'},
  {name: '이동/교통', slug: 'transit'},
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

// 상세 페이지 하단 고정 CTA 바 (Figma 72:429/442 PC, 72:459/469 MO).
// 유입 경로로 메인 버튼이 갈린다:
//   ?from=kakao (플친 메시지 유입) → ctaUrl 로 보낸다 (이미 플친이므로 콘텐츠 소비로 유도)
//   그 외                        → 플친 가입으로 보낸다
// ctaUrl/ctaLabel 은 Notion DB 프로퍼티이고 **비어 있는 게 정상값**이다. 채우는 규칙:
//   장소 여러 곳 소개  → 저장리스트 트래킹링크 + ctaLabel '소개된 곳 모아보기'
//   장소 1곳 소개      → 비움 (= 콘텐츠 홈)
//   장소가 아닌 정보   → 카테고리 트래킹링크 (라벨은 폴백값이 맞다)
// 상세 규칙은 /scc-web-articles-publish STEP 2.
const CTA = {
  home: 'https://link.staircrusher.club/articles_cta_home',
  browseLabel: '다른 콘텐츠 더 보기',
  kakaoLabel: '새로운 컨텐츠 알림받기',
};

/**
 * 트래킹링크에 campaign 파라미터를 붙인다.
 * airbridge 링크는 생성 시 campaignParams 를 비워둬야 재사용이 가능하므로(넣으면 URL 파라미터를
 * 덮어써버린다 — make_links.py 실측) 링크별 구분값은 이렇게 호출 시점에 붙인다.
 * **이미 있는 키는 덮어쓰지 않는다** — Notion 에 파라미터가 박힌 URL 이 들어와도 안전하게.
 */
function withCampaign(url, slug, creative) {
  const hashAt = url.indexOf('#');
  const hash = hashAt >= 0 ? url.slice(hashAt) : '';
  const [base, existing = ''] = (
    hashAt >= 0 ? url.slice(0, hashAt) : url
  ).split('?');
  const have = new Set(
    existing ? existing.split('&').map(p => p.split('=')[0]) : [],
  );
  const added = [
    ['campaign', 'articles-cta'],
    ['ad_group', slug],
    ['ad_creative', creative],
  ]
    .filter(([k, v]) => v && !have.has(k))
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`);
  const query = [existing, ...added].filter(Boolean).join('&');
  return base + (query ? `?${query}` : '') + hash;
}

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
/* ===== 상세 하단 고정 CTA 바 (Figma 72:429/442 PC, 72:459/469 MO) ===== */
/* Figma 에 그림자는 없다 — border-top 만. (bbucle-road FloatingBottomBar 는 shadow 를 쓰지만 여긴 아니다) */
/* safe-area 보정은 넣지 않는다: viewport meta 에 viewport-fit=cover 가 없어 env(safe-area-inset-*)
   가 규격상 0 이라 죽은 코드가 된다. cover 를 켜면 페이지 전체 레이아웃이 노치 아래로 확장돼
   아티클 본문까지 영향을 받으므로, 필요해지면 그때 페이지 단위로 결정한다. */
.cta-bar{position:fixed;left:0;right:0;bottom:0;z-index:200;background:#fff;border-top:1px solid var(--g25);padding:16px 0 20px;}
/* inner 폭을 본문 .wrap(720/24)에 맞춘다 — Figma PC 콘텐츠 674px(1920-623*2)와 사실상 동일 */
.cta-inner{max-width:720px;margin:0 auto;padding:0 24px;display:flex;align-items:center;gap:12px;}
.cta-icon{flex:0 0 auto;display:flex;align-items:center;justify-content:center;width:60px;height:60px;padding:0;appearance:none;-webkit-appearance:none;background:#fff;border:1px solid var(--g25);border-radius:4px;cursor:pointer;}
.cta-icon img{display:block;width:24px;height:24px;}
.cta-main{flex:1 1 0;min-width:0;display:none;align-items:center;justify-content:center;gap:6px;height:60px;border-radius:4px;padding:12px 32px;font-family:inherit;font-size:18px;line-height:26px;font-weight:700;letter-spacing:-0.36px;white-space:nowrap;text-decoration:none;overflow:hidden;}
.cta-main img{display:block;width:52px;height:32px;}
/* 기본(파라미터 없음/JS 없음) = 플친 가입 CTA. ?from=kakao 면 head 스크립트가 html[data-cta=list] 를 심는다 */
.cta-kakao{background:#fae100;color:#050708;display:flex;}
.cta-browse{background:var(--g90);color:#b8ff55;}
html[data-cta="list"] .cta-kakao{display:none;}
html[data-cta="list"] .cta-browse{display:flex;}
/* 고정 바가 푸터 하단을 덮지 않도록 */
body.has-cta{padding-bottom:96px;}
.cta-toast{position:fixed;left:50%;bottom:110px;transform:translateX(-50%);z-index:201;max-width:calc(100% - 32px);background:rgba(0,0,0,.82);color:#fff;font-size:14px;line-height:20px;padding:10px 16px;border-radius:8px;opacity:0;pointer-events:none;transition:opacity .2s;}
.cta-toast.on{opacity:1;}
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
  /* CTA 바 MO (Figma 72:459/469): 바 78px, 아이콘 48, 메인 48, 좌우 16 → inner 358 */
  .cta-bar{padding-top:10px;}
  .cta-inner{padding:0 16px;}
  .cta-icon{width:48px;height:48px;}
  .cta-main{height:48px;padding:12px 20px;font-size:15px;line-height:22px;}
  .cta-browse{letter-spacing:0;}
  .cta-kakao{letter-spacing:-0.3px;}
  .cta-main img{width:39px;height:24px;}
  body.has-cta{padding-bottom:78px;}
  .cta-toast{bottom:92px;}
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

// 카카오 유입 분기를 **페인트 전에** 확정한다. 정적 파일 하나로 두 변형을 서비스하므로
// (CloudFront 가 쿼리스트링을 캐시 키에 안 넣어도 무관) 이 한 줄이 <head> 에 있어야 깜빡임이 없다.
const CTA_BRANCH_JS =
  `<script>if(/[?&]from=kakao(?:&|$)/.test(location.search))` +
  `document.documentElement.setAttribute('data-cta','list');</script>\n` +
  // JS 가 없으면 하트/공유는 동작하지 않으므로 숨기고 CTA 링크만 남긴다.
  `<noscript><style>.cta-icon{display:none}</style></noscript>`;

/** 하단 고정 CTA 바. 두 메인 버튼을 모두 그려두고 CSS 로 하나만 노출한다. */
function ctaBar(meta) {
  const browseHref = withCampaign(
    meta.ctaUrl || CTA.home,
    meta.slug,
    'cta-browse',
  );
  const browseLabel = meta.ctaLabel || CTA.browseLabel;
  const kakaoHref = withCampaign(FOOTER.kakao, meta.slug, 'cta-kakao');
  const icon = (id, file, hidden) =>
    `<img${id ? ` id="${id}"` : ''} src="/articles/assets/${file}" alt="" width="24" height="24"${hidden ? ' hidden' : ''}>`;
  return `<div class="cta-bar" data-testid="article-cta-bar"><div class="cta-inner">
<button type="button" class="cta-icon" id="cta-heart" aria-pressed="false" aria-label="도움이 돼요">${icon('cta-heart-off', 'ic-heart.svg')}${icon('cta-heart-on', 'ic-heart-fill.svg', true)}</button>
<button type="button" class="cta-icon" id="cta-share" aria-label="공유하기">${icon('', 'ic-share.svg')}</button>
<a class="cta-main cta-kakao" data-cta-variant="kakao" href="${escapeAttr(kakaoHref)}" target="_blank" rel="noopener noreferrer"><img src="/articles/assets/cta-kakao-logo.png" alt="" width="52" height="32">${escapeHtml(CTA.kakaoLabel)}</a>
<a class="cta-main cta-browse" data-cta-variant="browse" href="${escapeAttr(browseHref)}" target="_blank" rel="noopener noreferrer">${escapeHtml(browseLabel)}</a>
</div><div class="cta-toast" id="cta-toast" role="status" aria-live="polite"></div></div>`;
}

// 하트(좋아요) + 공유. LIST_JS 와 같은 스타일(IIFE, var, optional chaining 없음)을 따른다.
//
// 토큰 주의: SPA(web.staircrusher.club)와 오리진을 공유하므로 localStorage 가 공유된다.
// SPA 는 `mmkv.default.scc-token` 에 JSON 인코딩된 토큰을 두는데, 여기에 쓰면 로그인 유저의
// 세션을 덮어쓴다. 그래서 **읽기만** 하고, 쓰기는 `anonymousAccessToken`(bbucle-road 가 이미
// 익명 좋아요 정체성으로 쓰는 키, 카카오 로그아웃도 의도적으로 보존한다)에만 한다.
const articleJs = slug => `<script>
(function(){
  var heart=document.getElementById('cta-heart'), share=document.getElementById('cta-share');
  var on=document.getElementById('cta-heart-on'), off=document.getElementById('cta-heart-off');
  if(!heart||!share||!on||!off) return;
  var toast=document.getElementById('cta-toast');
  var API=(function(){try{return localStorage.getItem('sccApiBase')||'';}catch(e){return '';}})()
    ||'https://api.staircrusher.club';
  var SLUG=${JSON.stringify(slug).replace(/</g, '\\u003c')};
  // canonical 을 slug 로 조립한다 — ?from=kakao 나 로컬 서버 주소에 영향받지 않아야 한다.
  var PAGE_URL='${SITE.baseUrl}/articles/'+SLUG;
  var upvoted=false, busy=false, spaTokenBad=false;
  function log(name,params){if(typeof gtag==='function'){gtag('event',name,params);}}
  function showToast(msg){
    if(!toast) return;
    toast.textContent=msg; toast.className='cta-toast on';
    setTimeout(function(){toast.className='cta-toast';},1800);
  }
  function paint(){
    on.hidden=!upvoted; off.hidden=upvoted;
    heart.setAttribute('aria-pressed',upvoted?'true':'false');
  }
  // SPA(로그인 유저) 토큰. 있으면 좋아요를 그 사람 것으로 기록한다. **읽기만 한다.**
  // 키 포맷이 두 가지다: webpack 이 react-native-mmkv 를 web/mocks 로 alias 하고 있어서 현재는
  // 'mmkv.default.scc-token'(dot) 이지만, alias 를 떼면 실제 패키지의 'mmkv.default\\scc-token'
  // (backslash, KEY_WILDCARD) 이 된다. 둘 다 읽어서 alias 변경에 안 깨지게 한다.
  // (못 읽으면 익명으로 폴백하므로 실패 방향은 안전하다 — 세션이 깨지는 게 아니라 집계 주체만 바뀐다)
  function readSpaToken(){
    if(spaTokenBad) return null;
    var keys=['mmkv.default.scc-token','mmkv.default\\\\scc-token'];
    for(var i=0;i<keys.length;i++){
      try{var v=localStorage.getItem(keys[i]);
        if(v){var t=JSON.parse(v); if(t) return t;}}catch(e){}
    }
    return null;
  }
  // 익명 정체성. **호출마다 새로 만들면 안 된다** — give 와 cancel 이 다른 유저로 기록돼
  // 취소가 no-op 이 된다(실측 버그). 캐시된 게 있으면 그걸 쓴다.
  function anonToken(cb){
    var t=null;
    try{t=localStorage.getItem('anonymousAccessToken');}catch(e){}
    if(t){cb(t);return;}
    mintToken(cb);
  }
  function mintToken(cb){
    fetch(API+'/createAnonymousUser',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})
      .then(function(r){return r.ok?r.json():null;})
      .then(function(d){
        var t=d&&d.authTokens&&d.authTokens.accessToken;
        if(t){try{
          localStorage.setItem('anonymousAccessToken',t);
          localStorage.setItem('anonymousTokenExpiry',String(Date.now()+315360000000));
        }catch(e){}}
        cb(t||null);
      }).catch(function(){cb(null);});
  }
  function post(path,body,token){
    return fetch(API+path,{method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
      body:JSON.stringify(body)});
  }
  // 401 처리는 어느 토큰이 실패했는지에 따라 갈린다.
  //  - SPA 토큰 만료 → SPA 키는 절대 건드리지 않고 익명 정체성으로 폴백한다.
  //  - 캐시된 익명 토큰 만료 → 그때만 그 키를 비우고 1회 재발급한다.
  function send(path,body,cb){
    var spa=readSpaToken();
    if(!spa){viaAnon(path,body,cb);return;}
    post(path,body,spa).then(function(r){
      if(r.status!==401){cb(r);return;}
      spaTokenBad=true;   // 남은 호출에서 매번 401 을 한 번 더 맞지 않도록
      viaAnon(path,body,cb);
    }).catch(function(){cb(null);});
  }
  function viaAnon(path,body,cb){
    anonToken(function(t){
      if(!t){cb(null);return;}
      post(path,body,t).then(function(r){
        if(r.status!==401){cb(r);return;}
        try{localStorage.removeItem('anonymousAccessToken');
          localStorage.removeItem('anonymousTokenExpiry');}catch(e){}
        mintToken(function(t2){
          if(!t2){cb(null);return;}
          post(path,body,t2).then(cb).catch(function(){cb(null);});
        });
      }).catch(function(){cb(null);});
    });
  }
  send('/getSccContentDetails',{url:PAGE_URL},function(r){
    if(!r||!r.ok) return;
    r.json().then(function(d){
      if(d&&d.upvoteSummary){upvoted=!!d.upvoteSummary.isUpvoted;paint();}
    }).catch(function(){});
  });
  heart.addEventListener('click',function(){
    // 서버에 (type,id,user) unique 제약이 없어서 연타하면 중복 row 가 생기고 취소로 안 지워진다.
    if(busy) return;
    busy=true;
    var next=!upvoted;
    upvoted=next; paint();
    log('article_upvote',{slug:SLUG,upvoted:next});
    send(next?'/giveUpvote':'/cancelUpvote',{targetType:'ARTICLE',id:SLUG},function(r){
      busy=false;
      if(!r||!r.ok){upvoted=!next;paint();}  // 실패하면 낙관적 토글을 되돌린다
    });
  });
  share.addEventListener('click',function(){
    log('article_share',{slug:SLUG});
    if(navigator.share){navigator.share({title:document.title,url:PAGE_URL}).catch(function(){});return;}
    // 안드로이드 WebView 등 Web Share 미지원 → 링크 복사로 폴백
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(PAGE_URL)
        .then(function(){showToast('링크를 복사했어요');})
        .catch(function(){showToast('링크 복사에 실패했어요');});
    }else{showToast('링크 복사를 지원하지 않는 브라우저예요');}
  });
  [].slice.call(document.querySelectorAll('.cta-main')).forEach(function(a){
    a.addEventListener('click',function(){
      log('article_cta_click',{slug:SLUG,variant:a.getAttribute('data-cta-variant')});
    });
  });
})();
</script>`;

function headCommon(title, desc, canonical, extra) {
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeAttr(desc)}">
<link rel="canonical" href="${escapeAttr(canonical)}">
${GA_SNIPPET}

<link rel="stylesheet" as="style" crossorigin href="${PRETENDARD_CDN}">
${extra}
<style>${BASE_CSS}</style>`;
}

/**
 * 개별 아티클 페이지.
 * meta: { title, summary, slug, ogImageUrl, contentHtml, faq[{q,a}], publishedAt, lastEditedTime,
 *         backHref?, ctaUrl?, ctaLabel? }
 * 본문 흐름 안의 태그 칩 · CTA 박스는 제거됨(2026-08 요청) — 본문 다음 바로 푸터다.
 * 대신 화면 하단에 **고정** CTA 바가 붙는다 (Figma 72:1445, 별개 요소) — ctaBar() 참조.
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
<meta property="og:url" content="${escapeAttr(url)}">
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
${CTA_BRANCH_JS}
</head>
<body class="has-cta">
${header()}
<div class="wrap">
<a class="back" href="${escapeAttr(meta.backHref || '/articles')}">← 목록으로</a>
<article data-testid="article-detail">
<h1 class="title">${escapeHtml(meta.title)}</h1>
<div class="article-date">${dateLabel}</div>
${meta.contentHtml}
</article>
</div>
${siteFooter()}
${ctaBar(meta)}
${articleJs(meta.slug)}
</body>
</html>`;
}

// 초기 노출 개수: 새로운 글 1 + 카드 12 = 13 (Figma anno_4). 더보기 1회당 +6.
const PAGE_SIZE = 12;
const PAGE_STEP = 6;

// 목록 필터 + 더보기. 서버를 더 부르지 않고 전 글을 DOM에 그려둔 뒤 노출만 토글한다
// (크롤러는 전 글 링크를 그대로 본다). `?category=` 가 없으면 초기 HTML 상태 = render()의
// 첫 결과라 깜빡임이 없고, 있을 때만 한 프레임 리페인트가 생긴다.
//
// `?category=<slug>` 는 칩이 선택된 상태를 공유·링크하기 위한 것(상세 CTA 목적지로 쓰인다).
// 색인용 랜딩페이지가 아니다 — <noscript> 가 칩을 숨기고 전 카드를 노출하므로 봇은 이 파라미터와
// 무관하게 전 글을 본다. 카테고리별 색인이 필요해지면 정적 파일 + canonical 이 따로 필요하다.
const LIST_JS = `<script>
(function(){
  var all=[].slice.call(document.querySelectorAll('.card'));
  if(!all.length) return;
  var tabs=[].slice.call(document.querySelectorAll('.cat'));
  var feat=document.querySelector('.feat'), sep=document.querySelector('.feat-sep');
  var moreWrap=document.querySelector('.more-wrap'), more=document.querySelector('.more');
  var empty=document.querySelector('.cat-empty');
  // 모르는 slug 는 '전체' 로 폴백한다 — 오타 URL 이 빈 목록 + "아직 글이 없어요" 를 띄우면 안 된다.
  function initialCat(){
    var m=/[?&]category=([^&#]*)/.exec(location.search);
    if(!m) return '';
    var slug=decodeURIComponent(m[1]);
    for(var i=0;i<tabs.length;i++){
      if(tabs[i].dataset.slug&&tabs[i].dataset.slug===slug) return tabs[i].dataset.cat||'';
    }
    return '';
  }
  var cat=initialCat(), limit=${PAGE_SIZE};
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
    // SSR HTML 은 '전체' 가 눌린 상태로 박혀 있다(정적 파일 1개라 쿼리를 알 수 없다) → 여기서 맞춘다.
    tabs.forEach(function(x){
      x.setAttribute('aria-pressed',(x.dataset.cat||'')===cat?'true':'false');
    });
    if(feat) feat.hidden=!!cat;
    if(sep) sep.hidden=!!cat;
    if(moreWrap) moreWrap.hidden=list.length<=limit;
    if(empty) empty.hidden=list.length>0;
  }
  tabs.forEach(function(t){
    t.addEventListener('click',function(){
      cat=t.dataset.cat||''; limit=${PAGE_SIZE};
      // replaceState: 칩 선택마다 히스토리를 쌓으면 뒤로가기가 목록 안에서 맴돈다.
      var slug=t.dataset.slug;
      history.replaceState(null,'',
        cat&&slug?'?category='+encodeURIComponent(slug):location.pathname);
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
<button type="button" class="cat" data-cat="" data-slug="" aria-pressed="true">전체</button>
${CATEGORIES.map(
  c =>
    `<button type="button" class="cat" data-cat="${escapeAttr(c.name)}" data-slug="${escapeAttr(c.slug)}" aria-pressed="false">${escapeHtml(c.name)}</button>`,
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
  CTA,
  escapeHtml,
  withCampaign,
  renderArticlePage,
  renderListPage,
};
