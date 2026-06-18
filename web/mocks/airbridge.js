// Web mock for airbridge-react-native-sdk (native attribution SDK).
const noop = () => {};

export const Airbridge = {
  init: noop,
  setOnDeeplinkReceived: noop,
  trackEvent: noop,
  setUserId: noop,
  clearUser: noop,
  trackDeeplink: noop,
};

export default {Airbridge};
