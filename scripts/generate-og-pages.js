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
const net = require('net');
const http = require('http');

const DIST_DIR = path.resolve(__dirname, '../web-dist');

// 빌드 산출물임을 식별하는 마커. 포트 스쿼터(웹팩 dev server 등 다른 프로세스)를
// 스크랩해 에러 페이지를 배포하는 사고를 막기 위해, 서버 응답/렌더 결과가 이 마커를
// 포함하는지 반드시 확인한다. (web/index.tsx 가 mount 하는 #root)
const APP_ROOT_MARKER = 'id="root"';

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
 * OS가 배정하는 빈 포트를 하나 얻는다. 하드코딩 포트(예: 3099)가 이미
 * 다른 dev server 로 점유돼 있으면, serve 가 bind 에 실패한 채로 진행돼
 * 그 스쿼터의 에러 페이지를 스크랩하는 사고가 났다. 매번 빈 포트를 써서 원천 차단.
 */
function getFreePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on('error', reject);
    srv.listen(0, () => {
      const {port} = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, res => {
        let body = '';
        res.on('data', c => (body += c));
        res.on('end', () => resolve({status: res.statusCode, body}));
      })
      .on('error', reject);
  });
}

/**
 * 서버가 "우리 빌드 산출물"을 서빙할 때까지 폴링한다. 응답이 200 이고
 * APP_ROOT_MARKER 를 포함해야 통과 — 아니면(포트 스쿼터 등) 끝까지 실패시켜
 * 에러 페이지 배포를 막는다.
 */
async function waitForServer(baseUrl, {tries = 40, delayMs = 250} = {}) {
  for (let i = 0; i < tries; i++) {
    try {
      const {status, body} = await httpGet(`${baseUrl}/`);
      if (status === 200 && body.includes(APP_ROOT_MARKER)) {
        console.log('   Server ready!');
        return;
      }
    } catch (_e) {
      // 아직 안 떴다 — 재시도
    }
    await new Promise(r => setTimeout(r, delayMs));
  }
  throw new Error(
    `Pre-render 서버(${baseUrl})가 빌드 산출물을 서빙하지 않는다(${APP_ROOT_MARKER} 없음). ` +
      `포트 스쿼터를 스크랩하지 않도록 중단한다.`,
  );
}

/**
 * 로컬 서버 시작 (빈 포트에 serve, 준비될 때까지 대기)
 */
async function startServer(port) {
  console.log(`📡 Starting local server on port ${port}...`);
  const server = spawn('npx', ['serve', DIST_DIR, '-l', String(port), '-s'], {
    stdio: 'pipe',
    shell: true,
  });
  server.on('error', err => {
    console.error('❌ serve 프로세스 시작 실패:', err);
  });
  await waitForServer(`http://localhost:${port}`);
  return server;
}

/**
 * 페이지 렌더링 및 HTML 추출
 */
async function renderPage(browser, pageConfig, baseUrl) {
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
    await page.goto(`${baseUrl}${pagePath}`, {
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

    // 클라이언트 전용 팝업(로그인 유도)은 정적 스냅샷에 박제되면 안 된다.
    // 박제되면 초기 페인트(정적 HTML)에 잠깐 떴다가 hydration 으로 사라지는 깜빡임이 생긴다.
    // 저장 직전에 제거한다(SEO/OG 스냅샷에도 팝업은 불필요).
    await page.evaluate(() => {
      document
        .querySelectorAll('[data-scc-daily-login-prompt]')
        .forEach(el => el.remove());
    });

    // 전체 HTML 추출
    let html = await page.content();

    // prerender 로컬 서버의 절대 URL(http://localhost:PORT/...)이 asset(img 등)에
    // 그대로 박히면 prod 에서 ERR_CONNECTION_REFUSED 가 난다. 상대경로로 치환.
    html = html.split(baseUrl).join('');

    // 산출물 검증 — SPA shell(#root)이 없으면 스쿼터/에러 페이지를 스크랩한 것.
    // 절대 저장/배포하지 않고 빌드를 실패시킨다.
    if (!html.includes(APP_ROOT_MARKER)) {
      throw new Error(
        `${pagePath} 렌더 결과에 ${APP_ROOT_MARKER} 가 없다 — 잘못된 페이지를 스크랩했다. 빌드 중단.`,
      );
    }

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

  // 1. 로컬 서버 시작 (빈 포트 — 포트 충돌로 스쿼터를 스크랩하는 사고 방지)
  const port = await getFreePort();
  const baseUrl = `http://localhost:${port}`;
  const server = await startServer(port);

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
      const html = await renderPage(browser, pageConfig, baseUrl);

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
