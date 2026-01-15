// Web implementation for @react-native-firebase/analytics using gtag
export const getAnalytics = () => ({
  logEvent: (eventName, params) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, params);
    }
    return Promise.resolve();
  },
  logScreenView: (params) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', params);
    }
    return Promise.resolve();
  },
  setUserId: (userId) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('set', {user_id: userId});
    }
    return Promise.resolve();
  },
  setUserProperties: (properties) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('set', 'user_properties', properties);
    }
    return Promise.resolve();
  },
  setAnalyticsCollectionEnabled: () => Promise.resolve(),
});

export default {
  getAnalytics,
};
