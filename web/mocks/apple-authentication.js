// Web mock for @invertase/react-native-apple-authentication.
// The Apple button is Platform.OS==='ios' gated, so these never execute on web;
// they only need to exist so imports resolve.
const reject = () => Promise.reject(new Error('Apple auth unavailable on web'));

export const appleAuth = {
  Operation: {LOGIN: 1, REFRESH: 2, LOGOUT: 3, IMPLICIT: 0},
  Scope: {FULL_NAME: 0, EMAIL: 1},
  State: {AUTHORIZED: 1, REVOKED: 0, NOT_FOUND: -1},
  performRequest: reject,
  getCredentialStateForUser: reject,
  isSupported: false,
};

export const appleAuthAndroid = {
  ResponseType: {ALL: 'code id_token', CODE: 'code', ID_TOKEN: 'id_token'},
  Scope: {ALL: 'name email', NAME: 'name', EMAIL: 'email'},
  configure: () => {},
  signIn: reject,
  isSupported: false,
};

export default appleAuth;
