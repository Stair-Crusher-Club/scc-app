/**
 * Puppeteer Pre-rendering Script
 *
 * 빌드 시점에 SEO 페이지들을 실제로 렌더링하여 HTML 추출
 * Lambda@Edge가 크롤러를 이 pre-rendered HTML로 라우팅
 */

const puppeteer = require('puppeteer');
const {spawn} = require('child_process');
const path = require('path');
const fs = require('fs');

const DIST_DIR = path.resolve(__dirname, '../web-dist');
const PORT = 3099;
const BASE_URL = `http://localhost:${PORT}`;

// SEO 페이지 목록
// 새 페이지 추가 시 여기에 추가
const SEO_PAGES = [
  {
    path: '/bbucle-road',
    waitFor: '[data-testid="bbucle-road-list"]',
    title: '뿌클로드 | 계단뿌셔클럽',
    description: '이동약자에게 필요한 진짜 접근성 정보 콘텐츠',
  },
  {
    path: '/bbucle-road/gocheok-skydome',
    waitFor: '[data-testid="bbucle-road-detail"]',
    title: '계단뿌셔클럽 | 휠체어로 고척 어때?',
    description: '뿌클로드 - 고척스카이돔 휠체어 접근성 정보',
  },
  {
    path: '/bbucle-road/kspo-dome',
    waitFor: '[data-testid="bbucle-road-detail"]',
    title: '계단뿌셔클럽 | 휠체어로 KSPO돔 어때?',
    description: '뿌클로드 - KSPO돔(올림픽체조경기장) 휠체어 접근성 정보',
  },
  {
    path: '/bbucle-road/ticketlink-live-arena',
    waitFor: '[data-testid="bbucle-road-detail"]',
    title: '계단뿌셔클럽 | 휠체어로 티켓링크라이브아레나 어때?',
    description: '뿌클로드 - 티켓링크라이브아레나 휠체어 접근성 정보',
  },
];

/**
 * 로컬 서버 시작
 */
async function startServer() {
  return new Promise((resolve, reject) => {
    console.log(`📡 Starting local server on port ${PORT}...`);

    const server = spawn('npx', ['serve', DIST_DIR, '-l', PORT, '-s'], {
      stdio: 'pipe',
      shell: true,
    });

    server.stderr.on('data', data => {
      const message = data.toString();
      // serve가 ready 메시지를 stderr로 출력
      if (message.includes('Accepting connections')) {
        console.log('   Server ready!');
        resolve(server);
      }
    });

    server.on('error', err => {
      reject(err);
    });

    // 타임아웃 (5초 후 강제 진행)
    setTimeout(() => {
      console.log('   Server timeout, proceeding anyway...');
      resolve(server);
    }, 5000);
  });
}

/**
 * 페이지 렌더링 및 HTML 추출
 */
async function renderPage(browser, pageConfig) {
  const {path: pagePath, waitFor, title, description} = pageConfig;
  const page = await browser.newPage();

  // 크롤러 User-Agent 설정
  await page.setUserAgent(
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  );

  // 뷰포트 설정 (데스크톱)
  await page.setViewport({width: 1280, height: 800});

  try {
    // 페이지 방문
    await page.goto(`${BASE_URL}${pagePath}`, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // React 렌더링 완료 대기
    if (waitFor) {
      await page.waitForSelector(waitFor, {timeout: 15000}).catch(() => {
        console.warn(`  ⚠️ Selector not found: ${waitFor}`);
      });
    }

    // 추가 대기 (동적 콘텐츠 로딩)
    await new Promise(r => setTimeout(r, 2000));

    // OG 메타 태그 주입 (head에 추가)
    await page.evaluate(
      meta => {
        // 기존 OG 태그 제거
        document
          .querySelectorAll('meta[property^="og:"], meta[name^="twitter:"]')
          .forEach(el => el.remove());

        const head = document.head;

        // OG 태그 추가
        const ogTags = `
          <meta property="og:type" content="website">
          <meta property="og:title" content="${meta.title}">
          <meta property="og:description" content="${meta.description}">
          <meta property="og:url" content="https://web.staircrusher.club${meta.path}">
          <meta property="og:site_name" content="계단뿌셔클럽">
          <meta name="twitter:card" content="summary_large_image">
          <meta name="twitter:title" content="${meta.title}">
          <meta name="twitter:description" content="${meta.description}">
        `;

        head.insertAdjacentHTML('beforeend', ogTags);

        // title 태그 업데이트
        const titleEl = document.querySelector('title');
        if (titleEl) {
          titleEl.textContent = meta.title;
        }
      },
      {title, description, path: pagePath},
    );

    // 전체 HTML 추출
    const html = await page.content();

    return html;
  } finally {
    await page.close();
  }
}

/**
 * sitemap.xml 생성
 */
function generateSitemap() {
  const siteUrl = 'https://web.staircrusher.club';
  const today = new Date().toISOString().split('T')[0];

  const urls = SEO_PAGES.map(
    page => `
  <url>
    <loc>${siteUrl}${page.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page.path === '/bbucle-road' ? '1.0' : '0.8'}</priority>
  </url>`,
  ).join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemap);
  console.log('📍 Generated: sitemap.xml');
}

/**
 * 메인 함수
 */
async function main() {
  console.log('🚀 Starting pre-rendering...\n');

  // 빌드 결과 확인
  if (!fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
    console.error('❌ web-dist/index.html not found. Run webpack build first.');
    process.exit(1);
  }

  // 1. 로컬 서버 시작
  const server = await startServer();

  // 2. Puppeteer 브라우저 시작
  console.log('\n🌐 Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    for (const pageConfig of SEO_PAGES) {
      console.log(`\n🔄 Rendering: ${pageConfig.path}`);

      // 페이지 렌더링
      const html = await renderPage(browser, pageConfig);

      // 파일 저장
      const outputDir = path.join(DIST_DIR, pageConfig.path);
      fs.mkdirSync(outputDir, {recursive: true});
      fs.writeFileSync(path.join(outputDir, 'index.html'), html);

      console.log(
        `   ✅ Saved: ${pageConfig.path}/index.html (${(html.length / 1024).toFixed(1)} KB)`,
      );
    }

    // sitemap.xml 생성
    console.log('\n');
    generateSitemap();
  } finally {
    await browser.close();
    server.kill();
  }

  console.log('\n🎉 Pre-rendering complete!');
}

main().catch(err => {
  console.error('❌ Pre-rendering failed:', err);
  process.exit(1);
});
