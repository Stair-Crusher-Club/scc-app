/**
 * 이탈(exit) 페이지 체류시간 계측 (웹 전용). import 만 하면 동작하는 side-effect 모듈.
 *
 * ── 왜 필요한가 (analysis_notes/20260804_web_page_dwell_time_feasibility.md)
 * 페이지 체류시간은 GA4 이벤트 타임스탬프로 계산하는데(`bi_report.web_page_dwell` 뷰),
 * 세션/탭의 **마지막 페이지**는 뒤에 이벤트가 없어 측정이 안 된다 (방문의 30~65%).
 * GA4 가 이 구멍을 메우도록 만들어 둔 `user_engagement` 이벤트는 실측 회수율이
 * 페이지 로드의 1.4% 뿐이었다. 이유 3가지:
 *   ① 트리거 조건이 좁다 — focus 1초 이상 + engagement 신호(10초↑ / pageview 2회↑ / 전환)
 *   ② Safari 는 링크 클릭으로 페이지를 떠날 때 visibilitychange 를 발화하지 않는다
 *   ③ gtag 는 누적 engagement 를 "다음 이벤트" 에 얹어 보내는데, 마지막 페이지 뒤에는
 *      태울 이벤트가 없다
 * 그래서 페이지가 숨겨지는 시점에 직접 `page_dwell` 이벤트를 쏜다.
 *
 * ── 설계 근거
 * - `visibilitychange`(→hidden) + `pagehide` 를 **둘 다** 걸어야 한다. 앞은 탭 전환·앱
 *   백그라운드를, 뒤는 Safari 의 navigate-away 를 커버한다. 둘을 합쳐 ~91% 신뢰도.
 * - `beforeunload`/`unload` 는 쓰지 않는다 — bfcache 를 무효화한다.
 * - 포그라운드(visible) 시간만 누적하므로, 방치된 탭이 체류시간을 부풀리는 문제
 *   (브라우저 wall time 의 99% 가 방치 탭이었다)에 구조적으로 면역이다.
 * - 전송은 gtag 가 내부적으로 sendBeacon 을 쓰므로 unload 중에도 나간다.
 * - 부수 효과: 종료 시점에 이벤트가 하나 생기므로 gtag 가 누적 engagement_time_msec 을
 *   여기에 실어 보낸다 → 뷰의 `engaged_sec` 품질도 같이 올라간다 (③의 해소).
 *
 * ── 왜 라우터 콜백이 아니라 history 를 후킹하는가 (실측으로 확인한 것)
 * 처음에는 RootScreen 의 NavigationContainer `onReady`/`onStateChange` 에서 리셋을
 * 호출했는데 둘 다 실패했다:
 *   - `onReady` 콜백은 웹에서 본문 중간까지 도달하지 않아 설치 자체가 안 됐다.
 *   - `onStateChange` 는 **URL 이 갱신되기 전에** 발화한다. 그 안에서 location.pathname 을
 *     읽으면 아직 이전 경로라서, 리셋이 "경로 변화 없음" 으로 판단해 no-op 이 된다.
 * 우리가 세그멘테이션하는 기준이 URL 이므로 URL 이 실제로 바뀌는 지점(history API,
 * popstate)을 직접 후킹하는 것이 정확하다. 덤으로 공유 코드(RootScreen)를 안 건드린다.
 */

const EVENT_NAME = 'page_dwell';
const INSTALL_FLAG = '__sccPageDwellInstalled';

type GtagFn = (
  command: 'event',
  eventName: string,
  params: Record<string, unknown>,
) => void;

let trackedPath: string | null = null;
/** 현재 구간이 visible 이 된 시각. null 이면 지금 hidden. */
let visibleSince: number | null = null;
/** 마지막 flush 이후 trackedPath 에서 누적한 visible 시간. */
let accumulatedMs = 0;
/** trackedPath 로 진입한 시각 (wall clock). */
let pathStartedAt = 0;

/**
 * 설치 여부는 모듈 변수가 아니라 window 에 기록한다. 모듈이 두 번 평가되면
 * (webpack HMR, 청크 중복) 모듈 스코프 boolean 은 인스턴스마다 false 로 시작해
 * 리스너가 두 벌 붙고 동일한 page_dwell 이 중복 전송된다.
 */
function isInstalled(): boolean {
  return !!(window as unknown as Record<string, unknown>)[INSTALL_FLAG];
}

function getGtag(): GtagFn | null {
  const gtag = (window as unknown as {gtag?: GtagFn}).gtag;
  return typeof gtag === 'function' ? gtag : null;
}

/** 뷰(`bi_report.web_page_dwell`)의 page_path 정규화와 동일하게 맞춘다. */
function currentPath(): string {
  return window.location.pathname.replace(/\/$/, '') || '/';
}

function isVisible(): boolean {
  return document.visibilityState === 'visible';
}

function visibleMs(): number {
  return (
    accumulatedMs + (visibleSince === null ? 0 : Date.now() - visibleSince)
  );
}

function resetAccumulator(path: string) {
  trackedPath = path;
  pathStartedAt = Date.now();
  accumulatedMs = 0;
  visibleSince = isVisible() ? Date.now() : null;
}

/**
 * 페이지가 숨겨지는 시점에 누적 체류시간을 전송한다.
 *
 * visibilitychange 와 pagehide 가 연달아 발화해도(탭 닫기) 중복 전송되지 않는다 —
 * 첫 flush 가 누적값을 0 으로 만들고, dwell_ms <= 0 이면 전송을 건너뛴다.
 */
function flush(reason: 'hidden' | 'pagehide') {
  const dwellMs = Math.round(visibleMs());
  const wallMs = Math.round(Date.now() - pathStartedAt);
  accumulatedMs = 0;
  visibleSince = null;

  if (dwellMs <= 0) {
    return;
  }
  // pagehide 중에는 document.location 이 이미 다음 URL 일 수 있어 gtag 가 자동으로
  // 붙이는 page_location 을 믿을 수 없다. 측정한 경로를 명시적으로 함께 보낸다.
  getGtag()?.('event', EVENT_NAME, {
    dwell_page_path: trackedPath,
    dwell_ms: dwellMs,
    wall_ms: wallMs,
    reason,
  });
}

/**
 * URL 이 바뀌었으면 누적기를 새 경로로 리셋한다.
 *
 * 이전 경로의 잔여 체류시간은 전송하지 않고 버린다 — 중간 페이지의 체류시간은 뷰가
 * 이벤트 타임스탬프로 이미 99% 잡고 있어서 이벤트를 더 쏠 이유가 없다.
 * ponytail: 라우트 변경 시에도 flush 하면 모든 방문이 포그라운드 실측값을 갖게 되어
 * 뷰의 dwell_sec_trimmed 휴리스틱을 실측으로 대체할 수 있다. 백그라운드 과대측정이
 * 중간 페이지에서도 문제가 되면 그때 flush('route_change') 를 추가한다.
 */
function noteRouteChange(): void {
  const path = currentPath();
  if (path === trackedPath) {
    return;
  }
  resetAccumulator(path);
}

/** SPA 라우트 변경 감지: history API 는 이벤트를 발화하지 않으므로 직접 감싼다. */
function watchUrlChanges(): void {
  const history = window.history;
  const originalPush = history.pushState.bind(history);
  const originalReplace = history.replaceState.bind(history);

  history.pushState = function (...args: Parameters<History['pushState']>) {
    const result = originalPush(...args);
    noteRouteChange();
    return result;
  };
  history.replaceState = function (
    ...args: Parameters<History['replaceState']>
  ) {
    const result = originalReplace(...args);
    noteRouteChange();
    return result;
  };
  // 뒤로/앞으로 가기
  window.addEventListener('popstate', noteRouteChange);
}

function install(): void {
  if (typeof window === 'undefined' || isInstalled()) {
    return;
  }
  (window as unknown as Record<string, unknown>)[INSTALL_FLAG] = true;
  resetAccumulator(currentPath());

  document.addEventListener('visibilitychange', () => {
    if (!isVisible()) {
      flush('hidden');
    } else if (visibleSince === null) {
      visibleSince = Date.now();
    }
  });

  // Safari 는 링크 클릭 이탈 시 visibilitychange 를 발화하지 않는다. pagehide 가 그 구멍을 메운다.
  window.addEventListener('pagehide', () => flush('pagehide'));

  watchUrlChanges();
}

install();
