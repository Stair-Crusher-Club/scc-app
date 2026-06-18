// Mock implementation of react-native-mmkv for web, backed by window.localStorage
// so values (e.g. scc-token, userInfo) persist across page reloads.
class MockMMKV {
  constructor(options = {}) {
    this.id = options.id || 'default';
    this.prefix = `mmkv.${this.id}.`;
  }

  _key(key) {
    return `${this.prefix}${key}`;
  }

  _getStore() {
    // SSR / non-browser guard (e.g. og-page prerender via puppeteer is fine,
    // but keep defensive in case localStorage is unavailable).
    try {
      return window.localStorage;
    } catch (e) {
      return null;
    }
  }

  set(key, value) {
    const store = this._getStore();
    if (!store) return;
    // MMKV accepts string | number | boolean; persist as string.
    store.setItem(this._key(key), String(value));
  }

  getString(key) {
    const store = this._getStore();
    if (!store) return null;
    const value = store.getItem(this._key(key));
    return value === null ? null : value;
  }

  getNumber(key) {
    const value = this.getString(key);
    if (value === null) return null;
    const num = Number(value);
    return Number.isNaN(num) ? null : num;
  }

  getBoolean(key) {
    const value = this.getString(key);
    if (value === null) return null;
    return value === 'true';
  }

  contains(key) {
    const store = this._getStore();
    if (!store) return false;
    return store.getItem(this._key(key)) !== null;
  }

  delete(key) {
    const store = this._getStore();
    if (!store) return;
    store.removeItem(this._key(key));
  }

  getAllKeys() {
    const store = this._getStore();
    if (!store) return [];
    const keys = [];
    for (let i = 0; i < store.length; i++) {
      const k = store.key(i);
      if (k && k.startsWith(this.prefix)) {
        keys.push(k.slice(this.prefix.length));
      }
    }
    return keys;
  }

  clearAll() {
    const store = this._getStore();
    if (!store) return;
    // Only clear this instance's prefixed keys.
    this.getAllKeys().forEach(k => store.removeItem(this._key(k)));
  }
}

export const MMKV = MockMMKV;
export default {MMKV: MockMMKV};
