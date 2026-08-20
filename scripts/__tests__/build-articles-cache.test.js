// --rerender 렌더 입력 캐시. 이 캐시가 조용히 미스를 삼키면 "성공 로그만 보고 반영됐다고
// 착각"하는 --offline 함정(2026-08-07)이 그대로 재현되므로, **미스가 미스로 잡히는지**를
// 고정한다. 미스 판정이 무너지면 낡은 HTML 이 배포된다.
const fs = require('fs');

const {
  cacheRead,
  cacheWrite,
  cacheFile,
  hasRenderCache,
  CACHE_DIR,
  CACHE_V,
} = require('../build-articles');

// 테스트가 실제 캐시를 오염시키지 않도록 쓰기 전 상태를 기억하고 끝나면 지운다.
const written = [];
const put = (kind, key, data) => {
  written.push(cacheFile(kind, key));
  cacheWrite(kind, key, data);
};
afterAll(() => {
  for (const f of written) if (fs.existsSync(f)) fs.rmSync(f);
  // 이 테스트가 캐시 디렉토리를 처음 만든 경우에만 정리한다
  if (fs.existsSync(CACHE_DIR) && fs.readdirSync(CACHE_DIR).length === 0)
    fs.rmdirSync(CACHE_DIR);
});

describe('--rerender 렌더 입력 캐시', () => {
  test('쓴 값을 그대로 되읽는다', () => {
    put('api', 'GET test/roundtrip ', {results: [{id: 'a'}]});
    expect(cacheRead('api', 'GET test/roundtrip ')).toEqual({
      results: [{id: 'a'}],
    });
  });

  test('없는 키는 undefined (null 과 구분된다)', () => {
    // null 은 "OG 조회했지만 카드 없음"이라는 유효한 캐시값이라 미스와 섞이면 안 된다
    expect(cacheRead('api', 'GET test/definitely-absent ')).toBeUndefined();
    put('og', 'https://example.com/no-og', null);
    expect(cacheRead('og', 'https://example.com/no-og')).toBeNull();
  });

  test('스키마 버전이 다르면 미스로 취급한다', () => {
    const f = cacheFile('api', 'GET test/stale-version ');
    written.push(f);
    fs.mkdirSync(CACHE_DIR, {recursive: true});
    fs.writeFileSync(f, JSON.stringify({v: CACHE_V + 1, data: {old: true}}));
    expect(cacheRead('api', 'GET test/stale-version ')).toBeUndefined();
  });

  test('깨진 JSON 은 미스로 취급한다 (빌드를 죽이지 않는다)', () => {
    const f = cacheFile('api', 'GET test/corrupt ');
    written.push(f);
    fs.mkdirSync(CACHE_DIR, {recursive: true});
    fs.writeFileSync(f, '{not json');
    expect(cacheRead('api', 'GET test/corrupt ')).toBeUndefined();
  });

  test('kind 가 다르면 키가 충돌하지 않는다', () => {
    put('api', 'same-key', 'from-api');
    put('layout', 'same-key', 'from-layout');
    expect(cacheRead('api', 'same-key')).toBe('from-api');
    expect(cacheRead('layout', 'same-key')).toBe('from-layout');
  });

  describe('hasRenderCache — 디렉토리를 건드리기 전 사전 점검', () => {
    // 왜 사전 점검인가: prepareArticleDir 가 렌더 시작 시 index.html 을 먼저 지운다.
    // 렌더 도중 미스가 나면 그 페이지가 빈 채로 남으므로, 진입 전에 걸러야 커밋본이 산다.
    const pid = '00000000-1111-2222-3333-444444444444';
    const childrenKey = `GET blocks/${pid}/children?page_size=100 `;

    test('둘 다 없으면 false', () => {
      expect(hasRenderCache(pid)).toBe(false);
    });

    test('블록만 있고 레이아웃이 없으면 false', () => {
      put('api', childrenKey, [{id: 'b1', type: 'paragraph'}]);
      expect(hasRenderCache(pid)).toBe(false);
    });

    test('블록 + 레이아웃이 모두 있으면 true', () => {
      put('api', childrenKey, [{id: 'b1', type: 'paragraph'}]);
      put('layout', pid, {img: {}, db: {}});
      expect(hasRenderCache(pid)).toBe(true);
    });

    test('레이아웃이 빈 객체여도(비공개 페이지 폴백) 캐시 히트다', () => {
      // fetchPageLayout 는 페이지가 비공개면 {img:{},db:{}} 를 준다. 그것도 유효한 입력이라
      // 미스로 잡히면 --rerender 가 영영 그 글을 건너뛴다.
      put('api', childrenKey, [{id: 'b1'}]);
      put('layout', pid, {img: {}, db: {}});
      expect(cacheRead('layout', pid)).toEqual({img: {}, db: {}});
      expect(hasRenderCache(pid)).toBe(true);
    });
  });
});
