// Mock for @react-native-firebase/analytics
export const getAnalytics = () => ({
  logEvent: () => Promise.resolve(),
  setUserId: () => Promise.resolve(),
  setUserProperties: () => Promise.resolve(),
  setAnalyticsCollectionEnabled: () => Promise.resolve(),
});

export default {
  getAnalytics,
};
