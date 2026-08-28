import {getAnalytics} from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';
import {Platform} from 'react-native';

import {logDebug} from '@/utils/DebugUtils';
import {convertToDevToolLoggedEvent} from '@/components/DevTool/devToolEventStore';
import {isInAppWebView} from '@/utils/appWebViewBridge';

/**
 * 이벤트가 발생한 표면. 이벤트 하나만 보고 세 케이스를 구분하기 위한 디멘션이다.
 *   'app'         네이티브 앱
 *   'web'         브라우저에서 직접 연 web.staircrusher.club
 *   'app_webview' 앱 인앱 웹뷰 안에서 열린 web.staircrusher.club
 *
 * 왜 클라이언트가 직접 선언하는가: 웹 두 케이스는 GA 에서 둘 다 platform='WEB' + app_info IS NULL 로
 * 들어와 구분이 안 된다. `bi_report/web_page_dwell.sql` 이 쓰던
 * `browser IN ('Android Webview','Safari (in-app)')` 휴리스틱은 카카오·인스타 인앱브라우저를
 * 앱 웹뷰로 오분류한다. 판정 주체는 자기가 어디서 도는지 아는 클라이언트여야 한다.
 *
 * 모듈 로드 시 1회 계산한다 — 한 JS 컨텍스트의 표면은 도중에 바뀌지 않는다.
 */
export const SURFACE: 'app' | 'web' | 'app_webview' =
  Platform.OS !== 'web' ? 'app' : isInAppWebView() ? 'app_webview' : 'web';

interface ElementEventParams {
  name: string;
  currScreenName: string;
  extraParams?: Record<string, any>;
}

interface ScreenViewParams {
  prevScreenName?: string;
  currScreenName?: string;
  extraParams?: Record<string, any>;
}

/**
 * 외부 지도앱 공유 텍스트 수신 경로.
 * `*_cold` 은 앱이 떠 있지 않아 PendingSharedText 를 거치는 경로다.
 */
export type SharedTextEntry =
  | 'android_cold'
  | 'android_foreground'
  | 'ios_cold'
  | 'ios_warm';

interface AppPushOpenParams {
  title: string;
  body: string;
  campaignId?: string;
  campaignType?: string;
  serverPushLogId?: string;
  extraParams?: Record<string, any>;
}

const currUserPropertiesForDebugging: {userId: string | undefined} = {
  userId: undefined,
};

// DevTool event tracking helpers
let eventLoggingEnabled = false;
let setLoggedEvents: ((events: any) => void) | null = null;

export const initializeEventLoggingDevTool = (
  setter: (events: any) => void,
) => {
  eventLoggingEnabled = true;
  setLoggedEvents = setter;
};

const trackEvent = (eventName: string, params: Record<string, any>) => {
  if (eventLoggingEnabled && setLoggedEvents) {
    setLoggedEvents((prev: any) =>
      convertToDevToolLoggedEvent(prev, {eventName, params}),
    );
  }
};

// Utility function to convert object keys to snake_case
const convertKeysToSnakeCase = (
  obj: Record<string, any>,
): Record<string, any> => {
  const convertedObj: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    // Convert camelCase to snake_case
    const snakeKey = key.replace(
      /[A-Z]/g,
      letter => `_${letter.toLowerCase()}`,
    );
    convertedObj[snakeKey] = value;
  }

  return convertedObj;
};

/**
 * Internal — logging infrastructure only (useLogger, LogView, useSccEventLogging).
 * 컴포넌트에서 직접 호출 금지. useLogger() hook을 사용하세요.
 */
export async function logElementView(params: ElementEventParams) {
  logDebug('logElementView', params, currUserPropertiesForDebugging);
  const eventParams = {
    ...convertKeysToSnakeCase(params.extraParams || {}),
    element_name: params.name,
    screen_name: params.currScreenName || 'unknown',
  };
  trackEvent('element_view', eventParams);
  getAnalytics().logEvent('element_view', eventParams);
}

/**
 * Internal — logging infrastructure only (useLogger, LogView, useSccEventLogging).
 * 컴포넌트에서 직접 호출 금지. useLogger() hook을 사용하세요.
 */
export async function logElementClick(params: ElementEventParams) {
  logDebug('logElementClick', params, currUserPropertiesForDebugging);
  const eventParams = {
    ...convertKeysToSnakeCase(params.extraParams || {}),
    element_name: params.name,
    screen_name: params.currScreenName,
  };
  trackEvent('element_click', eventParams);
  getAnalytics().logEvent('element_click', eventParams);
}

const Logger = {
  async setUserId(userId: string) {
    logDebug('setUserId', userId, currUserPropertiesForDebugging);
    // GA4 예약 user_id (BigQuery events.user_id 컬럼에 실림) — 사용자별 조회의 근간.
    // setUserProperties({userId})는 커스텀 user property일 뿐 예약 필드가 아니라 events.user_id에 안 실린다.
    // 둘 다 필요하다: BI(`scc_client.ga_event`)의 조인키는 user_properties.userId 쪽이다.
    getAnalytics().setUserId(userId);
    getAnalytics().setUserProperties({userId, surface: SURFACE});
    // Crashlytics도 동일 id로 태깅 → 콘솔/BigQuery(firebase_crashlytics)에서 계정으로 크래시 조회 가능.
    crashlytics().setUserId(userId);
    currUserPropertiesForDebugging.userId = userId;
    logDebug('setUserId finished', userId, currUserPropertiesForDebugging);
  },

  /**
   * 표면 디멘션만 먼저 심는다. setUserId 는 로그인/익명계정 발급 이후에나 호출되므로,
   * 그 전에 나가는 이벤트(첫 screen_view, splash_dismissed 등)도 표면으로 나눌 수 있게
   * 앱 부팅 시 1회 호출한다.
   */
  async setSurface() {
    logDebug('setSurface', SURFACE, currUserPropertiesForDebugging);
    getAnalytics().setUserProperties({surface: SURFACE});
  },

  async logScreenView(params: ScreenViewParams) {
    logDebug('logScreenView', params, currUserPropertiesForDebugging);
    const eventParams = {
      ...convertKeysToSnakeCase(params.extraParams || {}),
      previous_screen_name: params.prevScreenName,
      screen_name: params.currScreenName,
      screen_class: params.currScreenName,
    };
    trackEvent('screen_view', eventParams);
    getAnalytics().logScreenView(eventParams);
    // 크래시/ANR 리포트에 "어느 화면에서 죽었나" 맥락 남기기 (브레드크럼 + last_screen 속성).
    const screenName = params.currScreenName ?? 'unknown';
    crashlytics().log(`screen_view: ${screenName}`);
    crashlytics().setAttribute('last_screen', screenName);
  },

  async logUploadImage(metric: Record<string, number>) {
    logDebug('logUploadImage', metric, currUserPropertiesForDebugging);
    const eventParams = {
      ...metric,
    };
    trackEvent('upload_image', eventParams);
    getAnalytics().logEvent('upload_image', eventParams);
  },

  async logUploadImageFailed(params: {
    errorType: 'timeout' | 'network' | 'http_error' | 'unknown';
    httpStatus?: number;
    imageCount: number;
    retryCount: number;
    errorMessage: string;
    imageMime?: string;
    imageSizeMb?: number;
  }) {
    logDebug('logUploadImageFailed', params, currUserPropertiesForDebugging);
    const eventParams = {
      error_type: params.errorType,
      ...(params.httpStatus !== undefined && {
        http_status: params.httpStatus,
      }),
      image_count: params.imageCount,
      retry_count: params.retryCount,
      error_message: params.errorMessage,
      ...(params.imageMime !== undefined && {image_mime: params.imageMime}),
      ...(params.imageSizeMb !== undefined && {
        image_size_mb: params.imageSizeMb,
      }),
    };
    trackEvent('upload_image_failed', eventParams);
    getAnalytics().logEvent('upload_image_failed', eventParams);
  },

  async logAccessibilityRegistration(params: {
    type: 'place' | 'building';
    durationMillisImageUpload: number;
    durationMillisApiCall: number;
    durationMillisTotal: number;
    imageCount: number;
    success: boolean;
  }) {
    logDebug(
      'logAccessibilityRegistration',
      params,
      currUserPropertiesForDebugging,
    );
    const eventParams = {
      registration_type: params.type,
      duration_millis_image_upload: params.durationMillisImageUpload,
      duration_millis_api_call: params.durationMillisApiCall,
      duration_millis_total: params.durationMillisTotal,
      image_count: params.imageCount,
      success: params.success ? 1 : 0,
    };
    trackEvent('accessibility_registration', eventParams);
    getAnalytics().logEvent('accessibility_registration', eventParams);
  },

  async logError(error: Error) {
    logDebug('logError', error, currUserPropertiesForDebugging);
    crashlytics().recordError(error);
  },

  // OTA(HotUpdater) 번들 id를 크래시 리포트에 태깅.
  // app_version(네이티브 바이너리)만으론 어느 JS 번들이 크래시났는지 못 가리므로 필수.
  async setOtaBundleId(bundleId: string) {
    logDebug('setOtaBundleId', bundleId, currUserPropertiesForDebugging);
    crashlytics().setAttribute('ota_bundle_id', bundleId);
    getAnalytics().setUserProperties({otaBundleId: bundleId});
  },

  async logHeatSample(params: {
    sessionDurationMs: number;
    foregroundDurationMs: number;
    batteryLevel: number | null;
    batteryDeltaSession: number | null;
    gpsWatchMs: number;
    mapNativeViewMs: number;
    cameraActiveMs: number;
    imageUploadMs: number;
  }) {
    logDebug('logHeatSample', params, currUserPropertiesForDebugging);
    const eventParams = {
      session_duration_ms: params.sessionDurationMs,
      foreground_duration_ms: params.foregroundDurationMs,
      ...(params.batteryLevel !== null && {
        battery_level: params.batteryLevel,
      }),
      ...(params.batteryDeltaSession !== null && {
        battery_delta_session: params.batteryDeltaSession,
      }),
      gps_watch_ms: params.gpsWatchMs,
      map_native_view_ms: params.mapNativeViewMs,
      camera_active_ms: params.cameraActiveMs,
      image_upload_ms: params.imageUploadMs,
    };
    trackEvent('heat_sample', eventParams);
    getAnalytics().logEvent('heat_sample', eventParams);
  },

  // 콜드스타트 splash 지연 진단: HotUpdater(OTA) 프로세스 완료 시점
  async logOtaCompleted(params: {
    status: string; // UP_TO_DATE | UPDATE | ROLLBACK
    didDownload: boolean;
    jsToOtaMs: number; // JS 시작 ~ OTA 완료 (② 구간 근사: check 왕복 + 다운로드)
    downloadMs: number; // 첫 progress ~ OTA 완료 (다운로드만, 없으면 0)
    bundleId: string;
  }) {
    logDebug('logOtaCompleted', params, currUserPropertiesForDebugging);
    const eventParams = {
      status: params.status,
      did_download: params.didDownload ? 1 : 0,
      js_to_ota_ms: params.jsToOtaMs,
      download_ms: params.downloadMs,
      bundle_id: params.bundleId,
    };
    trackEvent('ota_completed', eventParams);
    getAnalytics().logEvent('ota_completed', eventParams);
  },

  // 콜드스타트 splash 지연 진단: splash가 사라지는 시점(NavigationContainer.onReady)
  async logSplashDismissed(params: {
    jsToNavReadyMs: number; // JS 시작 ~ splash 종료 (②+③ 합)
    otaToNavReadyMs: number; // OTA 완료 ~ splash 종료 (③ 마운트~navReady, OTA 미발화 시 0)
  }) {
    logDebug('logSplashDismissed', params, currUserPropertiesForDebugging);
    const eventParams = {
      js_to_nav_ready_ms: params.jsToNavReadyMs,
      ota_to_nav_ready_ms: params.otaToNavReadyMs,
    };
    trackEvent('splash_dismissed', eventParams);
    getAnalytics().logEvent('splash_dismissed', eventParams);
  },

  /**
   * 외부 지도앱 공유 수신. `screen_view(ResolvingSharedLink)` 는 로그인된 유저만 도달하므로
   * 비로그인 수신이 통째로 계측에서 빠져 있었다 — 수신 시점에 로그인 여부와 진입 경로를 남긴다.
   * 비로그인 건이 로그인 후 실제 해석까지 갔는지는 같은 session_id 의
   * ResolvingSharedLink screen_view 로 이어 본다.
   */
  async logSharedTextReceived(params: {
    entry: SharedTextEntry;
    isLoggedIn: boolean;
  }) {
    logDebug('logSharedTextReceived', params, currUserPropertiesForDebugging);
    const eventParams = {
      entry: params.entry,
      is_logged_in: params.isLoggedIn ? 1 : 0,
    };
    trackEvent('shared_text_received', eventParams);
    getAnalytics().logEvent('shared_text_received', eventParams);
  },

  async logAppPushOpen(params: AppPushOpenParams) {
    logDebug('logAppPushOpen', params, currUserPropertiesForDebugging);
    const eventParams = {
      ...convertKeysToSnakeCase(params.extraParams || {}),
      push_title: params.title,
      push_body: params.body,
      push_campaign_id: params.campaignId,
      push_campaign_type: params.campaignType,
      server_push_notification_log_id: params.serverPushLogId,
      user_id: currUserPropertiesForDebugging.userId,
    };
    trackEvent('app_push_open', eventParams);
    getAnalytics().logEvent('app_push_open', eventParams);
  },
};

export default Logger;
