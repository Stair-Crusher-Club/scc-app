/* eslint-env node */
// 회귀: 이미지 다운로드가 실패해도 이미 발행된 에셋이 사라지면 안 된다.
// 실제 사고 — yeonghee-festival 콜아웃 아이콘 2개가 notion.so/icons 403 + rmrf(srcDir) 조합으로
// 재빌드에서 소실됐다. (prod 유실)
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  prepareArticleDir,
  pruneUnusedAssets,
  pruneUnusedSubPages,
  reuseExistingAsset,
  ensureThumbnails,
  THUMB_NAME,
  isImage,
  isHeif,
} = require('../build-articles');

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'scc-articles-'));

test('prepareArticleDir는 assets를 보존하고 index.html만 지운다', () => {
  const srcDir = path.join(tmp(), 'slug');
  fs.mkdirSync(path.join(srcDir, 'assets'), {recursive: true});
  fs.writeFileSync(path.join(srcDir, 'assets', 'img-2.svg'), '<svg/>');
  fs.writeFileSync(path.join(srcDir, 'index.html'), 'old');

  const assetsDir = prepareArticleDir(srcDir);

  expect(fs.existsSync(path.join(assetsDir, 'img-2.svg'))).toBe(true);
  expect(fs.existsSync(path.join(srcDir, 'index.html'))).toBe(false);
});

test('다운로드 실패 시 같은 인덱스의 기존 에셋을 확장자 무관하게 찾아낸다', () => {
  const srcDir = path.join(tmp(), 'slug');
  const assetsDir = prepareArticleDir(srcDir);
  fs.writeFileSync(path.join(assetsDir, 'img-2.svg'), '<svg/>');

  expect(reuseExistingAsset(assetsDir, 2, 'img')).toBe('assets/img-2.svg');
  expect(reuseExistingAsset(assetsDir, 7, 'img')).toBeNull(); // 없으면 재사용 안 함
});

test('부모 정리가 상세 페이지 dir을 지우지 않는다 (자식 assets도 보호 대상)', () => {
  const srcDir = path.join(tmp(), 'parent');
  const childAssets = path.join(srcDir, 'busan-call-taxi', 'assets');
  fs.mkdirSync(childAssets, {recursive: true});
  fs.writeFileSync(path.join(childAssets, 'bm-0.jpg'), 'x');
  fs.writeFileSync(path.join(srcDir, 'index.html'), 'old');

  prepareArticleDir(srcDir);

  expect(fs.existsSync(path.join(childAssets, 'bm-0.jpg'))).toBe(true);
  expect(fs.existsSync(path.join(srcDir, 'index.html'))).toBe(false);
});

test('pruneUnusedSubPages는 이번에 발행 안 된 상세 페이지만 지운다', () => {
  const srcDir = path.join(tmp(), 'parent');
  fs.mkdirSync(path.join(srcDir, 'assets'), {recursive: true});
  fs.mkdirSync(path.join(srcDir, 'kept'), {recursive: true});
  fs.mkdirSync(path.join(srcDir, 'dropped'), {recursive: true});

  pruneUnusedSubPages(srcDir, [{slug: 'parent/kept'}]);

  expect(fs.existsSync(path.join(srcDir, 'kept'))).toBe(true);
  expect(fs.existsSync(path.join(srcDir, 'assets'))).toBe(true); // assets는 대상 아님
  expect(fs.existsSync(path.join(srcDir, 'dropped'))).toBe(false);
});

test('prune은 이번 빌드에서 안 쓰인 에셋만 지운다 (재사용분은 유지)', () => {
  const srcDir = path.join(tmp(), 'slug');
  const assetsDir = prepareArticleDir(srcDir);
  fs.writeFileSync(path.join(assetsDir, 'img-2.svg'), '<svg/>'); // 403 → 재사용 대상
  fs.writeFileSync(path.join(assetsDir, 'img-9.png'), 'stale'); // 본문에서 빠진 고아

  // downloadImage가 재사용 판정하면 markUsed로 등록된다 = 살아남아야 한다
  expect(reuseExistingAsset(assetsDir, 2, 'img')).toBe('assets/img-2.svg');
  pruneUnusedAssets(assetsDir);

  expect(fs.existsSync(path.join(assetsDir, 'img-2.svg'))).toBe(true);
  expect(fs.existsSync(path.join(assetsDir, 'img-9.png'))).toBe(false);
});

// 썸네일: 앱 홈/웹 목록이 3~7MB 원본 PNG를 받지 않게 하는 유일한 장치.
// 빌드는 incremental이고 pruneUnusedAssets가 markUsed 안 된 파일을 지우므로,
// "매번 다시 만들지 않는다(idempotent) + 원본이 바뀌면 다시 만든다(staleness)"가 핵심 계약이다.
describe('ensureThumbnails', () => {
  // 1x1 PNG. sharp가 실제로 디코드할 수 있는 최소 입력.
  const PNG_1X1 = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64',
  );

  const setup = slug => {
    const srcDir = tmp();
    const assetsDir = path.join(srcDir, slug, 'assets');
    fs.mkdirSync(assetsDir, {recursive: true});
    fs.writeFileSync(path.join(assetsDir, 'img-0.png'), PNG_1X1);
    return {srcDir, assetsDir};
  };

  const entryFor = slug => ({
    slug,
    image: `/articles/${slug}/assets/img-0.png`,
  });

  test('top-level 엔트리에 썸네일을 만들고 manifest에 thumbnail을 채운다', async () => {
    const {srcDir, assetsDir} = setup('hello');
    const manifest = {a: entryFor('hello')};

    expect(await ensureThumbnails(manifest, srcDir)).toBe(1);
    expect(fs.existsSync(path.join(assetsDir, THUMB_NAME))).toBe(true);
    expect(manifest.a.thumbnail).toBe(`/articles/hello/assets/${THUMB_NAME}`);
  });

  // 소비처(앱 카드/웹 목록)가 전부 16:9 박스다. 파일이 원본 비율이면 소비처의 object-fit
  // 하나만 빠져도 눌리거나 레터박스가 생긴다 → 파일 단계에서 비율을 확정한다.
  // resize에 withoutEnlargement를 주면 크롭이 통째로 스킵돼 이 테스트가 깨진다.
  test.each([
    ['가로가 긴 원본', 1600, 400],
    ['세로가 긴 원본', 400, 1600],
    ['정사각 원본', 800, 800],
    ['1024보다 작은 원본', 600, 400],
  ])('%s도 16:9로 중앙 크롭한다', async (_label, w, h) => {
    const sharp = require('sharp');
    const srcDir = tmp();
    const assetsDir = path.join(srcDir, 'x', 'assets');
    fs.mkdirSync(assetsDir, {recursive: true});
    await sharp({
      create: {width: w, height: h, channels: 3, background: '#888'},
    })
      .png()
      .toFile(path.join(assetsDir, 'img-0.png'));

    await ensureThumbnails({a: entryFor('x')}, srcDir);

    const out = await sharp(path.join(assetsDir, THUMB_NAME)).metadata();
    expect(out.width / out.height).toBeCloseTo(16 / 9, 2);
    // 확대 금지 — 두 축 다 본다. 폭만 보면 가로가 긴 원본(1600x400)이 세로 부족으로
    // 1.4배 업스케일되는 걸 놓친다.
    expect(out.width).toBeLessThanOrEqual(Math.min(1024, w));
    expect(out.height).toBeLessThanOrEqual(h);
  });

  test('두 번째 호출은 아무것도 다시 만들지 않는다 (idempotent)', async () => {
    const {srcDir} = setup('hello');
    const manifest = {a: entryFor('hello')};

    await ensureThumbnails(manifest, srcDir);

    expect(await ensureThumbnails(manifest, srcDir)).toBe(0);
    expect(manifest.a.thumbnail).toBeTruthy(); // 재생성 안 해도 필드는 유지된다
  });

  test('원본이 더 최신이면 다시 만든다 (prune이 지워도 자가 복구)', async () => {
    const {srcDir, assetsDir} = setup('hello');
    const manifest = {a: entryFor('hello')};
    await ensureThumbnails(manifest, srcDir);

    const future = Date.now() / 1000 + 60;
    fs.utimesSync(path.join(assetsDir, 'img-0.png'), future, future);

    expect(await ensureThumbnails(manifest, srcDir)).toBe(1);
  });

  test('parent 엔트리(상세 페이지)는 건너뛴다', async () => {
    const {srcDir, assetsDir} = setup('guide');
    const manifest = {a: {...entryFor('guide'), parent: 'other'}};

    expect(await ensureThumbnails(manifest, srcDir)).toBe(0);
    expect(fs.existsSync(path.join(assetsDir, THUMB_NAME))).toBe(false);
    expect(manifest.a.thumbnail).toBeUndefined();
  });

  test('원본이 없으면 조용히 건너뛴다', async () => {
    const manifest = {a: entryFor('missing')};

    expect(await ensureThumbnails(manifest, tmp())).toBe(0);
    expect(manifest.a.thumbnail).toBeUndefined();
  });
});

// 회귀: content-type 을 모르면 .jpg 로 뭉개던 폴백이 브라우저가 못 읽는 파일을 발행했다.
// 실제 사고 — HEIC 49건 + OG 스크랩이 물어온 HTML 페이지 1건이 .jpg/.png 로 prod 에 나가
// Chrome 에서 깨진 이미지로 떴다. 빌드·테스트는 전부 통과하는 종류라 여기서 막는다.
describe('isImage / isHeif (에셋 매직바이트 판정)', () => {
  const ftyp = brand =>
    Buffer.concat([
      Buffer.from([0, 0, 0, 0x18]),
      Buffer.from('ftyp' + brand, 'latin1'),
      Buffer.alloc(8),
    ]);

  it('진짜 이미지는 통과시킨다', () => {
    const jpeg = Buffer.concat([
      Buffer.from([0xff, 0xd8, 0xff]),
      Buffer.alloc(16),
    ]);
    const png = Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47]),
      Buffer.alloc(16),
    ]);
    const webp = Buffer.concat([
      Buffer.from('RIFF', 'latin1'),
      Buffer.alloc(4),
      Buffer.from('WEBP', 'latin1'),
    ]);
    expect(isImage(jpeg, 'application/octet-stream')).toBe(true);
    expect(isImage(png, '')).toBe(true);
    expect(isImage(webp, '')).toBe(true);
    expect(
      isImage(Buffer.from('<svg xmlns="..."></svg>'), 'image/svg+xml'),
    ).toBe(true);
  });

  it('HEIF 를 이미지로 인식하되 heic 로 표시한다', () => {
    for (const brand of ['heic', 'heix', 'mif1', 'hevc']) {
      expect(isHeif(ftyp(brand))).toBe(true);
      expect(isImage(ftyp(brand), '')).toBe(true);
    }
  });

  it('HTML 응답을 이미지로 통과시키지 않는다', () => {
    const html = Buffer.from(
      '<!DOCTYPE html>\n<html lang="ko"><head><meta charset="utf-8">',
    );
    expect(isImage(html, 'text/html')).toBe(false);
    // OG 스크랩 실패가 content-type 을 image 로 주더라도 매직바이트로 걸러야 한다.
    expect(isImage(html, 'image/jpeg')).toBe(false);
    expect(isHeif(html)).toBe(false);
  });

  it('mp4 처럼 ftyp 로 시작하는 비-HEIF 는 거른다', () => {
    expect(isHeif(ftyp('isom'))).toBe(false);
    expect(isImage(ftyp('isom'), '')).toBe(false);
  });
});
