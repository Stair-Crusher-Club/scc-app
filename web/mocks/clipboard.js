// Web mock for @react-native-clipboard/clipboard backed by the browser API.
const Clipboard = {
  setString(text) {
    try {
      navigator.clipboard?.writeText(text);
    } catch (e) {
      // ignore
    }
  },
  getString() {
    try {
      return navigator.clipboard?.readText() ?? Promise.resolve('');
    } catch (e) {
      return Promise.resolve('');
    }
  },
  hasString() {
    return Promise.resolve(true);
  },
};

export default Clipboard;
