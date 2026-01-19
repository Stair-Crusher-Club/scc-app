/**
 * 뿌클로드 페이지 스크린샷 캡처 스크립트
 *
 * 사용법:
 *   npx tsx capture-screenshots.ts <pageId> [viewport]
 *
 * 예시:
 *   npx tsx capture-screenshots.ts ticketlink-live-arena desktop
 *   npx tsx capture-screenshots.ts kspo-dome mobile
 *   npx tsx capture-screenshots.ts ticketlink-live-arena  # 둘 다 캡처
 *
 * 출력:
 *   scripts/screenshots/<pageId>/<section>-<viewport>.png
 */

import {chromium, Browser, Page} from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

// 탭 정의 (탭 라벨 텍스트로 클릭)
const TABS = [
  {name: 'overview', label: '한눈에보기'},
  {name: 'route', label: '교통정보'},
  {name: 'ticket-info', label: '매표정보'},
  {name: 'seat-view', label: '시야정보'},
  {name: 'nearby-places', label: '근처맛집'},
  {name: 'review', label: '방문후기'},
];

const VIEWPORTS = {
  desktop: {width: 1920, height: 1080},
  mobile: {width: 375, height: 812},
};

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function captureScreenshots(
  pageId: string,
  viewport: 'desktop' | 'mobile' | 'both' = 'both',
) {
  const outputDir = path.join(__dirname, 'screenshots', pageId);
  fs.mkdirSync(outputDir, {recursive: true});

  const browser: Browser = await chromium.launch({headless: true});

  const viewportsToCapture =
    viewport === 'both' ? ['desktop', 'mobile'] : [viewport];

  for (const vp of viewportsToCapture) {
    const vpConfig = VIEWPORTS[vp as keyof typeof VIEWPORTS];
    const context = await browser.newContext({
      viewport: vpConfig,
      deviceScaleFactor: 2,
    });
    const page: Page = await context.newPage();

    const url = `${BASE_URL}/bbucle-road/${pageId}`;
    console.log(`\n📸 Capturing ${vp} screenshots for: ${url}`);

    try {
      await page.goto(url, {waitUntil: 'networkidle', timeout: 60000});

      // 페이지 로드 후 추가 대기 (동적 콘텐츠)
      await page.waitForTimeout(3000);

      // 페이지 전체 스크롤하여 lazy loading 콘텐츠 로드
      await page.evaluate(async () => {
        await new Promise<void>((resolve) => {
          let totalHeight = 0;
          const distance = 500;
          const timer = setInterval(() => {
            const scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;
            if (totalHeight >= scrollHeight) {
              clearInterval(timer);
              window.scrollTo(0, 0); // 맨 위로 복귀
              resolve();
            }
          }, 100);
        });
      });

      // 스크롤 후 추가 대기
      await page.waitForTimeout(2000);

      // 전체 페이지 스크린샷 (기본 탭 - 한눈에보기)
      const fullPagePath = path.join(outputDir, `full-page-${vp}.png`);
      await page.screenshot({path: fullPagePath, fullPage: true});
      console.log(`  ✅ Full page (default tab): ${fullPagePath}`);

      // 각 탭 클릭 후 스크린샷
      for (const tab of TABS) {
        try {
          // 탭 버튼 찾기 (텍스트로 검색)
          const tabButton = await page.locator(`text="${tab.label}"`).first();

          if (await tabButton.isVisible()) {
            await tabButton.click();
            await page.waitForTimeout(1000); // 탭 전환 대기

            // 해당 탭의 전체 페이지 스크린샷
            const tabPath = path.join(outputDir, `tab-${tab.name}-${vp}.png`);
            await page.screenshot({path: tabPath, fullPage: true});
            console.log(`  ✅ Tab ${tab.name}: ${tabPath}`);
          } else {
            console.log(`  ⚠️  Tab ${tab.name}: button not visible`);
          }
        } catch (err) {
          console.log(`  ❌ Tab ${tab.name}: error - ${err}`);
        }
      }
    } catch (err) {
      console.error(`Error capturing ${vp}: ${err}`);
    }

    await context.close();
  }

  await browser.close();
  console.log(`\n✨ Screenshots saved to: ${outputDir}`);
}

// CLI 실행
const args = process.argv.slice(2);
if (args.length < 1) {
  console.log('Usage: npx ts-node capture-screenshots.ts <pageId> [viewport]');
  console.log('  viewport: desktop | mobile | both (default: both)');
  console.log('Example: npx ts-node capture-screenshots.ts ticketlink-live-arena desktop');
  process.exit(1);
}

const pageId = args[0];
const viewport = (args[1] as 'desktop' | 'mobile' | 'both') || 'both';

captureScreenshots(pageId, viewport).catch(console.error);
