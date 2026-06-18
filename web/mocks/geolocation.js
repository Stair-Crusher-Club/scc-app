// Web mock for @react-native-community/geolocation backed by the browser
// Geolocation API. Position shape ({coords:{latitude,longitude,...}}) matches
// the native module's GeolocationResponse, so callers need no changes.
const browserGeo =
  typeof navigator !== 'undefined' ? navigator.geolocation : undefined;

const Geolocation = {
  // Native signature: requestAuthorization(success?, error?)
  requestAuthorization(success, error) {
    // Browser permission is prompted lazily on first getCurrentPosition.
    // Resolve immediately so callers proceed; the actual prompt happens below.
    if (success) success();
  },

  getCurrentPosition(success, error, options) {
    if (!browserGeo) {
      error && error({code: 2, message: 'Geolocation unavailable'});
      return;
    }
    browserGeo.getCurrentPosition(success, error, options);
  },

  watchPosition(success, error, options) {
    if (!browserGeo) {
      error && error({code: 2, message: 'Geolocation unavailable'});
      return -1;
    }
    return browserGeo.watchPosition(success, error, options);
  },

  clearWatch(watchId) {
    if (browserGeo && watchId >= 0) {
      browserGeo.clearWatch(watchId);
    }
  },

  stopObserving() {},
  setRNConfiguration() {},
};

export default Geolocation;
