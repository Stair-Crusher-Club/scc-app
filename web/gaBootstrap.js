/* eslint-env node */
/**
 * web.staircrusher.club 의 GA(gtag) 부트스트랩 스니펫 — **단일 소스**.
 *
 * 소비처가 둘이고 빌드 파이프라인이 다르다:
 *   1. SPA        `web/index.html`  (webpack HtmlWebpackPlugin templateParameters → `<%= gaBootstrap %>`)
 *   2. 정적 아티클  `scripts/article-template.js` (node 생성기가 문자열 연결)
 * 그래서 TS 가 아니라 **CommonJS 로 문자열을 export** 한다 (node 에서 require 가능해야 함).
 * `/bbucle-road` prerender(`scripts/generate-og-pages.js`)는 빌드된 index.html 을 puppeteer 로
 * 렌더해 dump 하므로 자동으로 상속된다.
 *
 * ── 왜 `gtag('config')` **앞**에서 신원을 세팅하는가
 * config 는 호출 즉시 첫 page_view 를 큐에 넣는다. 번들이 로드된 뒤 `Logger.setUserId` 가
 * 부르는 `gtag('set', ...)` 는 그보다 늦어서, 첫 이벤트에는 신원이 안 붙는다.
 * (실측: 웹 page_view 의 user_id 커버리지 38% vs element_view 88%)
 *
 * ── 왜 user_properties 를 config 인자로도 넘기는가
 * `gtag('set','user_properties',{...})` 만으로는 후속 이벤트에 지속되지 않는다 —
 * 실측으로 heat_sample 10,430건 중 userId 가 붙은 건 1건이었다(0.01%). 반면 예약 user_id 는 86%.
 * 그래서 (a) set, (b) config 인자, (c) 전역 event param 세 경로를 모두 쓴다. 중복은 무해하다.
 */

const GA_MEASUREMENT_ID = 'G-B80XR4HWJE';

/**
 * 표면(surface) 판정과 userId 조회를 담는 인라인 스크립트.
 * 번들 로드 전에 실행되므로 ES5 로만 작성한다.
 */
const IDENTITY_SCRIPT = `
(function(){
  // 앱 인앱 웹뷰: WebViewScreen 의 injectedJavaScriptBeforeContentLoaded 가
  // 페이지 스크립트보다 먼저 window.__SCC_APP_AUTH__ 를 심어둔다. 그게 앱 유저의 신원이다.
  // 브라우저: 직전 세션이 남긴 localStorage. 첫 방문자는 신원이 없다(익명계정 발급 전) —
  // 그 경우 번들의 Logger.setUserId 가 나중에 채운다.
  //
  // mmkv 키가 두 포맷인 것은 scripts/article-template.js 의 readSpaToken 과 같은 이유다:
  // webpack 이 react-native-mmkv 를 web/mocks 로 alias 하고 있어 지금은 'mmkv.default.userInfo'
  // (dot) 이지만, alias 를 떼면 실제 패키지의 'mmkv.default\\\\userInfo' (backslash) 가 된다.
  function readUserId(){
    try {
      var injected = window.__SCC_APP_AUTH__;
      if (injected && injected.userId) return injected.userId;
    } catch (e) {}
    var keys = ['mmkv.default.userInfo', 'mmkv.default\\\\userInfo'];
    for (var i = 0; i < keys.length; i++) {
      try {
        var raw = localStorage.getItem(keys[i]);
        if (raw) {
          var user = JSON.parse(raw);
          if (user && user.id) return user.id;
        }
      } catch (e) {}
    }
    return null;
  }

  // react-native-webview 는 자신이 로드한 모든 페이지에 ReactNativeWebView 를 주입한다
  // (토큰 주입 여부와 무관). web/utils/isInAppWebView.ts 와 동일한 신호를 쓴다.
  var surface = window.ReactNativeWebView ? 'app_webview' : 'web';
  var userId = readUserId();

  var userProperties = {surface: surface};
  if (userId) userProperties.userId = userId;

  gtag('set', 'user_properties', userProperties);
  gtag('set', {surface: surface});
  var config = {user_properties: userProperties};
  if (userId) config.user_id = userId;
  gtag('config', '${GA_MEASUREMENT_ID}', config);
})();`;

const GA_BOOTSTRAP_SNIPPET = `<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
${IDENTITY_SCRIPT}
</script>`;

module.exports = {GA_MEASUREMENT_ID, GA_BOOTSTRAP_SNIPPET};
