// Web mock for react-native-device-info.
// NOTE: do not reference process.env here — webpack's DefinePlugin inlines it as
// a bare object literal, which breaks arrow concise-bodies (`() => {..}` parses
// as a block). Keep static values.
const DeviceInfo = {
  // High semver so the app's "update required" version check treats web as
  // up-to-date (a non-semver like 'web' triggers "Invalid version format").
  getVersion: () => '99.0.0',
  getBuildNumber: () => '0',
  getSystemName: () => 'Web',
  getSystemVersion: () =>
    typeof navigator !== 'undefined' ? navigator.userAgent : 'web',
  getBatteryLevel: () => Promise.resolve(-1),
  getUniqueId: () => Promise.resolve('web'),
  getModel: () => 'web',
  isEmulator: () => Promise.resolve(false),
};

export default DeviceInfo;
