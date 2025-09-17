// Mock for @react-native-firebase/crashlytics
const crashlytics = () => ({
  recordError: () => Promise.resolve(),
  log: () => Promise.resolve(),
  setUserId: () => Promise.resolve(),
  setAttribute: () => Promise.resolve(),
  setAttributes: () => Promise.resolve(),
  crash: () => Promise.resolve(),
});

export default crashlytics;
