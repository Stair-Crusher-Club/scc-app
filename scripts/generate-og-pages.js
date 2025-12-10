const fs = require('fs');
const path = require('path');

// BbucleRoad OG 데이터
const BBUCLE_ROAD_DATA = {
  'gocheok-skydome': {
    title: '계단뿌셔클럽 | 휠체어로 고척 어때?',
    description: '뿌클로드 - 이동약자에게 필요한 진짜 접근성 정보 콘텐츠',
    ogImageUrl: 'https://scc-dev-accessibility-images-2.s3.ap-northeast-2.amazonaws.com/20251210134039_05A23F65BACB4DB8.png',
  },
};

const SITE_URL = 'https://web.staircrusher.club';

function generateOgTags(id, data) {
  return `
  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${data.title}">
  <meta property="og:description" content="${data.description}">
  <meta property="og:image" content="${data.ogImageUrl}">
  <meta property="og:url" content="${SITE_URL}/bbucle-road/${id}">
  <meta property="og:site_name" content="계단뿌셔클럽">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${data.title}">
  <meta name="twitter:description" content="${data.description}">
  <meta name="twitter:image" content="${data.ogImageUrl}">
`;
}

// Generate pages
const distDir = path.resolve(__dirname, '../web-dist');
const baseHtmlPath = path.join(distDir, 'index.html');

// 기본 index.html 읽기
if (!fs.existsSync(baseHtmlPath)) {
  console.error('❌ Base index.html not found. Run webpack build first.');
  process.exit(1);
}

const baseHtml = fs.readFileSync(baseHtmlPath, 'utf-8');

console.log('🔗 Generating OG pages...');

Object.entries(BBUCLE_ROAD_DATA).forEach(([id, data]) => {
  // OG 태그 생성
  const ogTags = generateOgTags(id, data);

  // <title> 태그를 페이지별 제목으로 교체하고, OG 태그 삽입
  let pageHtml = baseHtml
    .replace(/<title>.*?<\/title>/, `<title>${data.title}</title>${ogTags}`);

  // 디렉토리 생성 및 파일 저장
  const dir = path.join(distDir, 'bbucle-road', id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), pageHtml);
  console.log(`  ✅ Generated: bbucle-road/${id}/index.html`);
});

console.log('🎉 OG pages generation complete!');
