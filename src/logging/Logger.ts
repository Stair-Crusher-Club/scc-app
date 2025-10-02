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

const Logger = {
  async setUserId(userId: string) {
    logDebug('setUserId', userId, currUserPropertiesForDebugging);
    getAnalytics().setUserProperties({userId});
    currUserPropertiesForDebugging.userId = userId;
    logDebug('setUserId finished', userId, currUserPropertiesForDebugging);
  },

  /**
   * Please use LogView component, instead of using logElementView directly.
   */
  async logElementView(params: ElementEventParams) {
    logDebug('logElementView', params, currUserPropertiesForDebugging);
    const eventParams = {
      ...convertKeysToSnakeCase(params.extraParams || {}),
      element_name: params.name,
      screen_name: params.currScreenName,
    };
    trackEvent('element_view', eventParams);
    getAnalytics().logEvent('element_view', eventParams);
  },

  /**
   * Please use LogClick component, instead of using logElementClick directly.
   */
  async logElementClick(params: ElementEventParams) {
    logDebug('logElementClick', params, currUserPropertiesForDebugging);
    const eventParams = {
      ...convertKeysToSnakeCase(params.extraParams || {}),
      element_name: params.name,
      screen_name: params.currScreenName,
    };
    trackEvent('element_click', eventParams);
    getAnalytics().logEvent('element_click', eventParams);
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
      user_id: currUserPropertiesForDebugging.userId,
    };
    trackEvent('app_push_open', eventParams);
    getAnalytics().logEvent('app_push_open', eventParams);
  },
};

export default Logger;
