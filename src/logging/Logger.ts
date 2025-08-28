import {getAnalytics} from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';

import {logDebug} from '@/utils/DebugUtils';


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
    getAnalytics().logEvent('element_view', {
      ...(params.extraParams || {}),
      element_name: params.name,
      screen_name: params.currScreenName,
    });
  },

  /**
   * Please use LogClick component, instead of using logElementClick directly.
   */
  async logElementClick(params: ElementEventParams) {
    logDebug('logElementClick', params, currUserPropertiesForDebugging);
    getAnalytics().logEvent('element_click', {
      ...(params.extraParams || {}),
      element_name: params.name,
      screen_name: params.currScreenName,
    });
  },

  async logScreenView(params: ScreenViewParams) {
    logDebug('logScreenView', params, currUserPropertiesForDebugging);
    getAnalytics().logScreenView({
      ...(params.extraParams || {}),
      previous_screen_name: params.prevScreenName,
      screen_name: params.currScreenName,
      screen_class: params.currScreenName,
    });
  },

  async logUploadImage(metric: Record<string, number>) {
    logDebug('logUploadImage', metric, currUserPropertiesForDebugging);
    getAnalytics().logEvent('upload_image', {
      ...metric,
    });
  },

  async logError(error: Error) {
    logDebug('logError', error, currUserPropertiesForDebugging);
    crashlytics().recordError(error);
  },

  async logAppPushOpen(params: AppPushOpenParams) {
    logDebug('logAppPushOpen', params, currUserPropertiesForDebugging);
    getAnalytics().logEvent('app_push_open', {
      ...(params.extraParams || {}),
      push_title: params.title,
      push_body: params.body,
      push_campaign_id: params.campaignId,
      push_campaign_type: params.campaignType,
      user_id: currUserPropertiesForDebugging.userId,
    });
  }
};

export default Logger;
