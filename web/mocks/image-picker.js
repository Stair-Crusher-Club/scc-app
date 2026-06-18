// Web mock for react-native-image-picker (album selection is app-only on web).
export const launchImageLibrary = (options, callback) => {
  const result = {didCancel: true};
  if (callback) callback(result);
  return Promise.resolve(result);
};

export const launchCamera = (options, callback) => {
  const result = {didCancel: true};
  if (callback) callback(result);
  return Promise.resolve(result);
};

export default {launchImageLibrary, launchCamera};
