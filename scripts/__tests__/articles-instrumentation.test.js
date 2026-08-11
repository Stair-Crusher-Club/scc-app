// 정적 /articles 페이지의 GA 계측. 앱/SPA 와 **같은 이벤트 shape** 을 내보내는 게 목적이라
// (screen_view / element_click / element_view / userId / surface), 렌더 결과 문자열과
// 공유 스니펫으로만 검증할 수 있다.
//
// 실측 배경(2026-08): 이 페이지는 element_click 0건, element_view 0건, page_dwell 0건,
// user_id 0건이었다. 앱 홈 ArticleSection 이 웹뷰로 트래픽을 보내는데 계측이 비어 있었다.
const vm = require('vm');

const {renderArticlePage, renderListPage} = require('../article-template');
const {
  GA_MEASUREMENT_ID,
  GA_BOOTSTRAP_SNIPPET,
} = require('../../web/gaBootstrap');

const article = (over = {}) =>
  renderArticlePage({
    title: '테스트 글',
    summary: '요약',
    slug: 'test-slug',
    faq: [],
    contentHtml: '<p>본문</p>',
    ogImageUrl: '',
    publishedAt: '2026-08-07T00:00:00.000Z',
    lastEditedTime: '2026-08-07T00:00:00.000Z',
    ...over,
  });

const list = () =>
  renderListPage([
    {
      title: '첫 글',
      slug: 'first',
      summary: '요약1',
      publishedAt: '2026-08-07T00:00:00.000Z',
    },
    {
      title: '둘째 글',
      slug: 'second',
      summary: '요약2',
      publishedAt: '2026-08-06T00:00:00.000Z',
    },
  ]);

// 스니펫을 **실제로 평가해** gtag('config') 로 나가는 user_properties 를 캡처한다.
// 문자열 포함 검사로는 "코드가 있다" 까지만 알 수 있고 "값이 실린다" 는 모른다 —
// 계측 버그는 컴파일·린트·타입체크를 전부 통과하므로 나간 페이로드로만 판정한다.
// (사고 2026-08-10: gtag('set',{user_id:null}) 이 신원을 지운다고 가정한 clearUserId)
const sentUserProperties = ({webview = false, injected, stored} = {}) => {
  const js = GA_BOOTSTRAP_SNIPPET.replace(/<script[^>]*>|<\/script>/g, '');
  const dataLayer = [];
  const win = {dataLayer};
  if (webview) win.ReactNativeWebView = {postMessage() {}};
  if (injected) win.__SCC_APP_AUTH__ = injected;
  const localStorage = {getItem: key => (stored && stored[key]) || null};
  // 스니펫은 브라우저 **전역**(window/localStorage/dataLayer)에 의존하는 ES5 다.
  // vm 은 sandbox 를 전역 객체로 쓰므로 브라우저와 같은 해석이 된다
  // (new Function 은 이걸 인자 스코프로 바꿔버리고 no-new-func 에도 걸린다).
  vm.runInNewContext(js, {window: win, localStorage, dataLayer});
  const config = dataLayer.find(args => args[0] === 'config');
  return config[2].user_properties;
};

describe('GA 부트스트랩 스니펫 (SPA/정적 공유)', () => {
  test('신원을 config 보다 먼저 세팅한다', () => {
    // config 가 첫 page_view 를 즉시 큐에 넣으므로, 그 전에 user_id 가 정해져 있어야
    // 첫 이벤트부터 신원이 붙는다. (기존: page_view user_id 커버리지 38%)
    const setIdx = GA_BOOTSTRAP_SNIPPET.indexOf(
      "gtag('set', 'user_properties'",
    );
    const configIdx = GA_BOOTSTRAP_SNIPPET.indexOf("gtag('config'");
    expect(setIdx).toBeGreaterThan(-1);
    expect(configIdx).toBeGreaterThan(setIdx);
  });

  test('config 에도 user_id/user_properties 를 같이 넘긴다', () => {
    // set 만으로는 후속 이벤트에 user property 가 붙지 않는다(실측 0.01%).
    expect(GA_BOOTSTRAP_SNIPPET).toContain('config.user_id = userId');
    expect(GA_BOOTSTRAP_SNIPPET).toContain('user_properties: userProperties');
  });

  test('앱 웹뷰 주입값을 localStorage 보다 우선한다', () => {
    const injectedIdx = GA_BOOTSTRAP_SNIPPET.indexOf('window.__SCC_APP_AUTH__');
    const localIdx = GA_BOOTSTRAP_SNIPPET.indexOf(
      'localStorage.getItem(keys[i])',
    );
    expect(injectedIdx).toBeGreaterThan(-1);
    expect(localIdx).toBeGreaterThan(injectedIdx);
  });

  test('mmkv 키는 dot/backslash 두 포맷을 모두 읽는다', () => {
    // webpack alias 유무에 따라 키가 갈린다 — article-template 의 readSpaToken 과 같은 이유.
    // 브라우저가 실제로 평가할 **소스 텍스트** 를 그대로 검사한다. `\\` 두 글자가 emit 돼야
    // JS 리터럴로 평가될 때 백슬래시 1개가 된다 (한 글자만 emit 되면 escape 로 먹힌다).
    const keys = /var keys = (\[[^\]]*\]);/.exec(GA_BOOTSTRAP_SNIPPET)[1];
    expect(keys).toBe("['mmkv.default.userInfo', 'mmkv.default\\\\userInfo']");
  });

  test('surface 를 선언적으로 판정한다 (browser 휴리스틱이 아니라)', () => {
    expect(GA_BOOTSTRAP_SNIPPET).toContain(
      "window.ReactNativeWebView ? 'app_webview' : 'web'",
    );
  });

  // 신원 없는 app_webview 이벤트를 두 원인으로 갈라내기 위한 진단 키.
  // 이 4갈래가 실제로 구분되지 않으면 bridgeVersion 을 실은 의미가 없다.
  describe('bridgeVersion 진단 키', () => {
    test('신앱: userId + bridgeVersion=2', () => {
      expect(
        sentUserProperties({
          webview: true,
          injected: {userId: 'U1', bridgeVersion: 2},
        }),
      ).toEqual({surface: 'app_webview', userId: 'U1', bridgeVersion: '2'});
    });

    test('구앱: userId 를 주입하지 않지만 bridgeVersion=1 로 식별된다', () => {
      // OTA 전파되면 소멸하는 케이스. userId 부재의 "설명 가능한" 쪽.
      expect(
        sentUserProperties({webview: true, injected: {bridgeVersion: 1}}),
      ).toEqual({surface: 'app_webview', bridgeVersion: '1'});
    });

    test('레거시 비회원: bridgeVersion=2 인데 userId 가 없다 (영구 케이스)', () => {
      // WebViewScreen 이 ANONYMOUS_USER_TEMPLATE.id('0') 을 의도적으로 제외해 null 을 주입한다.
      // 구앱과 달리 OTA 로 사라지지 않으므로 이 조합으로 규모를 재야 한다.
      expect(
        sentUserProperties({
          webview: true,
          injected: {userId: null, bridgeVersion: 2},
        }),
      ).toEqual({surface: 'app_webview', bridgeVersion: '2'});
    });

    test('브라우저: 진단 키가 붙지 않는다', () => {
      expect(sentUserProperties()).toEqual({surface: 'web'});
    });

    test('신원 채널은 진단 키에 영향받지 않는다', () => {
      // localStorage 폴백 경로에서도 userId 는 그대로 실린다.
      expect(
        sentUserProperties({
          webview: true,
          injected: {bridgeVersion: 1},
          stored: {'mmkv.default.userInfo': JSON.stringify({id: 'LOCAL_1'})},
        }),
      ).toEqual({
        surface: 'app_webview',
        userId: 'LOCAL_1',
        bridgeVersion: '1',
      });
    });
  });
});

describe('정적 아티클 페이지 계측', () => {
  test('상세: 공유 GA 스니펫 + 계측 번들이 실린다', () => {
    const html = article();
    expect(html).toContain(GA_MEASUREMENT_ID);
    expect(html).toContain(GA_BOOTSTRAP_SNIPPET);
    expect(html).toContain(
      '<script defer src="/articles-analytics.js"></script>',
    );
  });

  test('상세: screen_view 맥락을 body 로 넘긴다', () => {
    expect(article()).toContain(
      '<body class="has-cta" data-screen-name="Article" data-slug="test-slug">',
    );
  });

  test('상세: 인터랙티브 요소에 element_name 이 전부 붙어 있다', () => {
    const html = article();
    for (const name of [
      'article_upvote',
      'article_share',
      'article_cta_kakao',
      'article_cta_browse',
      'article_back_to_list',
    ]) {
      expect(html).toContain(`data-element-name="${name}"`);
    }
  });

  test('목록: screen_view 맥락 + 카드/탭/더보기가 모두 계측된다', () => {
    const html = list();
    expect(html).toContain('<body data-screen-name="ArticleList">');
    // 카테고리 탭과 더보기는 CTA 바 작업 때 새로 붙었는데 계측이 없었다.
    expect(html).toContain('data-element-name="article_list_category_all"');
    expect(html).toContain('data-element-name="article_list_category_food"');
    expect(html).toContain('data-element-name="article_list_more"');
    expect(html).toContain('data-element-name="article_list_card"');
    expect(html).toContain('data-element-name="article_list_featured_card"');
  });

  test('목록: 카드는 자기 slug 를 실어 보낸다 (어느 글이 눌렸는지)', () => {
    const html = list();
    expect(html).toContain('data-log-slug="first"');
    expect(html).toContain('data-log-slug="second"');
  });

  test('노출(element_view) 대상은 opt-in 으로만 지정한다', () => {
    // 앱의 trackView 와 같은 정책. 카드와 CTA 바만 노출을 남긴다.
    expect(list()).toContain(
      'data-element-name="article_list_card" data-track-view',
    );
    expect(article()).toContain(
      'data-element-name="article_cta_bar" data-track-view',
    );
  });
});
