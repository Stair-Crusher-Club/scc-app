import {getAnalytics} from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';

import {logDebug} from '@/utils/DebugUtils';
import {convertToDevToolLoggedEvent} from '@/components/DevTool/devToolEventStore';

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
    getAnalytics().setUserProperties({userId});
    currUserPropertiesForDebugging.userId = userId;
    logDebug('setUserId finished', userId, currUserPropertiesForDebugging);
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
