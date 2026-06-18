// Web mock for @react-native-community/image-editor (crop is app-only on web).
const ImageEditor = {
  cropImage: uri => Promise.resolve({uri, path: uri}),
};

export default ImageEditor;
