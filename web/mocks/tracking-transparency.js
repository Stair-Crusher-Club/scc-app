// Web mock for react-native-tracking-transparency (iOS ATT only).
export const requestTrackingPermission = () => Promise.resolve('unavailable');
export const getTrackingStatus = () => Promise.resolve('unavailable');
