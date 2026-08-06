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
