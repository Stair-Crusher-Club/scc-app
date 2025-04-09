import analytics from '@react-native-firebase/analytics';
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

const Logger = {
  async setUserId(userId: string) {
    analytics().setUserProperties({userId});
  },

  /**
   * Please use LogView component, instead of using logElementView directly.
   */
  async logElementView(params: ElementEventParams) {
    logDebug('logElementView', params);
    analytics().logEvent('element_view', {
      ...(params.extraParams || {}),
      element_name: params.name,
      screen_name: params.currScreenName,
    });
  },

  /**
   * Please use LogClick component, instead of using logElementClick directly.
   */
  async logElementClick(params: ElementEventParams) {
    logDebug('logElementClick', params);
    analytics().logEvent('element_click', {
      ...(params.extraParams || {}),
      element_name: params.name,
      screen_name: params.currScreenName,
    });
  },

  async logScreenView(params: ScreenViewParams) {
    logDebug('logScreenView', params);
    analytics().logScreenView({
      ...(params.extraParams || {}),
      previous_screen_name: params.prevScreenName,
      screen_name: params.currScreenName,
      screen_class: params.currScreenName,
    });
  },

  async logUploadImage(metric: Record<string, number>) {
    analytics().logEvent('upload_image', {
      ...metric,
    });
  },

  async logError(error: Error) {
    crashlytics().recordError(error);
  },
};

export default Logger;
