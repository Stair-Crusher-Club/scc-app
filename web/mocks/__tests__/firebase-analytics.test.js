// 웹 빌드의 @react-native-firebase/analytics shim (webpack alias).
// 이름/파라미터가 네이티브와 갈리면 앱·웹·앱웹뷰를 한 기준으로 비교할 수 없다.
const {getAnalytics} = require('../firebase-analytics');

describe('web analytics shim', () => {
  let calls;

  beforeEach(() => {
    calls = [];
    global.window = {gtag: (...args) => calls.push(args)};
  });

  afterEach(() => {
    delete global.window;
  });

  test('화면 조회는 네이티브와 같은 screen_view 로 나간다 (page_view 아님)', () => {
    getAnalytics().logScreenView({screen_name: 'Home', screen_class: 'Home'});
    expect(calls).toEqual([
      ['event', 'screen_view', {screen_name: 'Home', screen_class: 'Home'}],
    ]);
  });

  test('setUserId 는 예약 user_id 와 커스텀 userId 를 모두 세팅한다', () => {
    // 예약 user_id → BigQuery events.user_id 컬럼.
    // 커스텀 userId → user_properties.userId = scc_client.ga_event 의 조인키.
    getAnalytics().setUserId('U1');
    expect(calls).toContainEqual(['set', {user_id: 'U1', userId: 'U1'}]);
    expect(calls).toContainEqual(['set', 'user_properties', {userId: 'U1'}]);
  });

  test('user property 는 전역 event param 으로도 보낸다', () => {
    // gtag('set','user_properties') 만으로는 후속 이벤트에 붙지 않는 걸 실측했다
    // (heat_sample 10,430건 중 1건). 전역 param 경로를 함께 쓴다.
    getAnalytics().setUserProperties({surface: 'app_webview'});
    expect(calls).toEqual([
      ['set', 'user_properties', {surface: 'app_webview'}],
      ['set', {surface: 'app_webview'}],
    ]);
  });

  test('gtag 가 없어도 터지지 않는다', () => {
    global.window = {};
    expect(() => getAnalytics().logEvent('x', {})).not.toThrow();
  });
});
