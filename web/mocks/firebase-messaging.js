// Mock for @react-native-firebase/messaging
export const getMessaging = () => ({
  hasPermission: () => Promise.resolve(1),
  requestPermission: () => Promise.resolve(1),
  getToken: () => Promise.resolve('mock-token'),
  onMessage: () => () => {}, // unsubscribe function
  onTokenRefresh: () => () => {}, // unsubscribe function
  subscribeToTopic: () => Promise.resolve(),
  unsubscribeFromTopic: () => Promise.resolve(),
});

const messaging = () => getMessaging();

export default messaging;
