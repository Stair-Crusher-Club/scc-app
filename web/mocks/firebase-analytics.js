// Web implementation for @react-native-firebase/analytics using gtag.
//
// 목표는 네이티브 Firebase Analytics 와 **같은 이벤트 이름 · 같은 파라미터**를 내보내는 것이다.
// 이름이나 신원이 갈리면 앱/웹/앱웹뷰를 한 기준으로 비교할 수 없다.
//
// user property 주의: `gtag('set','user_properties',{...})` 만으로는 후속 이벤트에 잘 붙지 않는다
// (실측: heat_sample 10,430건 중 userId 가 붙은 건 1건). 반면 `gtag('set',{...})` 로 세팅한
// 전역 event param 과 예약 user_id 는 안정적으로 붙는다(86%). 그래서 두 경로를 모두 쓴다.
// 페이지 로드 시점의 초기값은 head 스니펫(web/gaBootstrap.js)이 config 인자로도 넘긴다.
const callGtag = (...args) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(...args);
  }
};

export const getAnalytics = () => ({
  logEvent: (eventName, params) => {
    callGtag('event', eventName, params);
    return Promise.resolve();
  },
  // 네이티브가 발사하는 이름과 동일하게 `screen_view` 를 쓴다. GA4 가 초기 로드에 자동으로
  // 발사하는 `page_view` 는 그대로 남으므로 웹 고유 지표도 유지된다.
  // (bi_report.web_page_dwell 은 event_name='page_view' 로 필터하지 않고 모든 이벤트의
  //  page_location 으로 페이지를 나누므로, 라우트 변경 시 이벤트가 계속 발사되면 무영향이다.)
  logScreenView: (params) => {
    callGtag('event', 'screen_view', params);
    return Promise.resolve();
  },
  setUserId: (userId) => {
    // 예약 user_id (BigQuery events.user_id 컬럼) + 커스텀 user property `userId`
    // (`scc_client.ga_event` 의 조인키) 둘 다 필요하다.
    callGtag('set', {user_id: userId, userId: userId});
    callGtag('set', 'user_properties', {userId: userId});
    return Promise.resolve();
  },
  setUserProperties: (properties) => {
    callGtag('set', 'user_properties', properties);
    // 전역 event param 으로도 실어 보낸다 — 위 주석의 지속성 문제 대비.
    callGtag('set', properties);
    return Promise.resolve();
  },
  setAnalyticsCollectionEnabled: () => Promise.resolve(),
});

export default {
  getAnalytics,
};
