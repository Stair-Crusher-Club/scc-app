// Mock for @react-native-firebase/messaging
export const AuthorizationStatus = {
  NOT_DETERMINED: -1,
  DENIED: 0,
  AUTHORIZED: 1,
  PROVISIONAL: 2,
};

export const getMessaging = () => ({
  hasPermission: () => Promise.resolve(1),
  requestPermission: () => Promise.resolve(1),
  getToken: () => Promise.resolve('mock-token'),
  getInitialNotification: () => Promise.resolve(null),
  onMessage: () => () => {}, // unsubscribe function
  onTokenRefresh: () => () => {}, // unsubscribe function
  onNotificationOpenedApp: () => () => {},
  subscribeToTopic: () => Promise.resolve(),
  unsubscribeFromTopic: () => Promise.resolve(),
});

const messaging = () => getMessaging();

export default messaging;
