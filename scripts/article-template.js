/**
 * Article HTML template (self-contained, JS-free, SEO/AEO 최적)
 *
 * web.staircrusher.club/articles 정적 페이지의 셸/메타/구조화데이터를 생성한다.
 * - SPA(web/index.tsx → App.tsx)의 480px 모바일 프레임을 타지 않는 독립 HTML.
 * - 콘텐츠 컬럼 ~720px 자체 반응형. 크롤러/LLM이 JS 없이 본문을 읽을 수 있도록 인라인 CSS.
 *
 * build-articles.js에서 사용. 여기서는 본문(contentHtml)을 생성하지 않고 셸만 만든다.
 */

const SITE = {
  baseUrl: 'https://web.staircrusher.club',
  name: '계단뿌셔클럽',
  // 앱 설치/서비스 유도 CTA (저장→로그인 기능은 다음 페이즈)
  appUrl: 'https://staircrusher.club',
  logo: 'https://web.staircrusher.club/articles/assets/scc-logo.png',
};

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(s) {
  return escapeHtml(s);
}

const BASE_CSS = `
:root { --fg:#191919; --muted:#6b6b6b; --line:#ececec; --accent:#1f6feb; --bg:#fff; --callout-bg:#f7f6f3; }
* { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body { margin:0; background:var(--bg); color:var(--fg);
  font-family:'Pretendard Variable',Pretendard,-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo','Malgun Gothic',sans-serif;
  font-size:18px; line-height:1.75; word-break:keep-all; }
a { color:var(--accent); text-decoration:none; } a:hover { text-decoration:underline; }
img { max-width:100%; height:auto; border-radius:8px; }
.site-header, .site-footer { max-width:760px; margin:0 auto; padding:16px 20px; }
.site-header { display:flex; align-items:center; gap:10px; border-bottom:1px solid var(--line); }
.site-header img { width:28px; height:28px; border-radius:6px; }
.site-header b { font-size:16px; }
main { max-width:760px; margin:0 auto; padding:24px 20px 64px; }
article h1 { font-size:32px; line-height:1.3; margin:8px 0 4px; }
.article-meta { color:var(--muted); font-size:14px; margin-bottom:8px; }
.lead { font-size:19px; color:#333; background:var(--callout-bg); border-left:3px solid var(--accent);
  padding:14px 16px; border-radius:8px; margin:16px 0 28px; }
article h2 { font-size:24px; margin:36px 0 12px; line-height:1.35; }
article h3 { font-size:20px; margin:28px 0 10px; }
article p { margin:14px 0; }
article ul, article ol { margin:14px 0; padding-left:24px; }
article li { margin:6px 0; }
blockquote { margin:18px 0; padding:8px 16px; border-left:3px solid #d0d0d0; color:#555; }
.callout { display:flex; gap:10px; background:var(--callout-bg); border:1px solid var(--line);
  border-radius:10px; padding:14px 16px; margin:18px 0; }
.callout .emoji { flex:0 0 auto; }
details { background:var(--callout-bg); border:1px solid var(--line); border-radius:10px; padding:8px 14px; margin:14px 0; }
details summary { cursor:pointer; font-weight:600; }
pre { background:#0d1117; color:#e6edf3; padding:16px; border-radius:10px; overflow:auto; font-size:14px; }
code { font-family:ui-monospace,SFMono-Regular,Menlo,monospace; }
:not(pre) > code { background:#f0f0f0; padding:2px 6px; border-radius:5px; font-size:0.9em; }
hr { border:0; border-top:1px solid var(--line); margin:32px 0; }
.columns { display:flex; flex-wrap:wrap; gap:20px; margin:18px 0; }
.columns > .column { flex:1 1 0; min-width:220px; }
table { border-collapse:collapse; width:100%; margin:18px 0; font-size:16px; }
th, td { border:1px solid var(--line); padding:8px 10px; text-align:left; }
figure { margin:18px 0; } figcaption { color:var(--muted); font-size:14px; text-align:center; margin-top:6px; }
.tags { margin:28px 0 0; }
.tags span { display:inline-block; background:#f0f0f0; color:#555; border-radius:14px; padding:4px 12px; font-size:13px; margin:0 6px 6px 0; }
.cta { max-width:760px; margin:40px auto 0; padding:24px 20px; background:var(--callout-bg);
  border-radius:14px; text-align:center; }
.cta a { display:inline-block; background:var(--accent); color:#fff; padding:12px 24px; border-radius:24px;
  font-weight:600; margin-top:10px; }
.site-footer { border-top:1px solid var(--line); color:var(--muted); font-size:14px; }
/* article list */
.article-list { list-style:none; padding:0; margin:24px 0 0; }
.article-list li { padding:20px 0; border-bottom:1px solid var(--line); }
.article-list h2 { font-size:21px; margin:0 0 6px; }
.article-list p { color:var(--muted); margin:0; font-size:16px; }
`;

function jsonLd(obj) {
  return `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;
}

function header() {
  // 로고 img는 루트상대경로 → 로컬/프로덕션 모두 정상. (og/JSON-LD는 절대 URL인 SITE.logo 사용)
  return `<header class="site-header">
  <a href="/articles"><img src="/articles/assets/scc-logo.png" alt="${SITE.name}"></a>
  <b>${SITE.name}</b>
</header>`;
}

function footerCta() {
  return `<section class="cta">
  <div>이동약자를 위한 진짜 접근성 정보, 계단뿌셔클럽에서 더 보기</div>
  <a href="${SITE.appUrl}">계단뿌셔클럽 바로가기</a>
  <!-- TODO(다음 페이즈): 저장 버튼 → 로그인 유도 -->
</section>
<footer class="site-footer">© ${SITE.name}</footer>`;
}

/**
 * 개별 아티클 페이지 HTML.
 * meta: { title, summary, slug, ogImageUrl, tags[], contentHtml, faq[{q,a}], createdTime, lastEditedTime }
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

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(meta.title)} | ${SITE.name}</title>
<meta name="description" content="${escapeAttr(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:title" content="${escapeAttr(meta.title)}">
<meta property="og:description" content="${escapeAttr(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:site_name" content="${SITE.name}">
<meta property="og:image" content="${escapeAttr(ogImage)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeAttr(meta.title)}">
<meta name="twitter:description" content="${escapeAttr(desc)}">
<meta name="twitter:image" content="${escapeAttr(ogImage)}">
<link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css">
<style>${BASE_CSS}</style>
${ld.map(jsonLd).join('\n')}
</head>
<body>
${header()}
<main>
<article data-testid="article-detail">
<h1>${escapeHtml(meta.title)}</h1>
<div class="article-meta">${dateLabel}</div>
${desc ? `<p class="lead">${escapeHtml(desc)}</p>` : ''}
${meta.contentHtml}
${tagsHtml}
</article>
</main>
${footerCta()}
</body>
</html>`;
}

/**
 * /articles 목록 페이지.
 * articles: [{ slug, title, summary, createdTime }] (시간 역순 정렬은 호출측 책임)
 */
function renderListPage(articles) {
  const url = `${SITE.baseUrl}/articles`;
  const items = articles
    .map(
      a => `<li>
  <a href="/articles/${a.slug}"><h2>${escapeHtml(a.title)}</h2></a>
  <p>${escapeHtml(a.summary || '')}</p>
</li>`,
    )
    .join('\n');

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
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>아티클 | ${SITE.name}</title>
<meta name="description" content="이동약자를 위한 접근성 정보 콘텐츠 모음 - ${SITE.name}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:title" content="아티클 | ${SITE.name}">
<meta property="og:description" content="이동약자를 위한 접근성 정보 콘텐츠 모음">
<meta property="og:url" content="${url}">
<meta property="og:site_name" content="${SITE.name}">
<link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css">
<style>${BASE_CSS}</style>
${jsonLd(ld)}
</head>
<body>
${header()}
<main>
<h1>아티클</h1>
<ul class="article-list" data-testid="article-list">
${items}
</ul>
</main>
${footerCta()}
</body>
</html>`;
}

module.exports = {SITE, escapeHtml, renderArticlePage, renderListPage};
