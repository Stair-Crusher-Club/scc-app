// Mock implementation of react-native-mmkv for web
class MockMMKV {
  constructor(options = {}) {
    this.id = options.id || 'default';
    this.storage = {};
  }

  set(key, value) {
    this.storage[key] = value;
  }

  getString(key) {
    return this.storage[key] || null;
  }

  getNumber(key) {
    const value = this.storage[key];
    return typeof value === 'number' ? value : null;
  }

  getBoolean(key) {
    const value = this.storage[key];
    return typeof value === 'boolean' ? value : null;
  }

  contains(key) {
    return key in this.storage;
  }

  delete(key) {
    delete this.storage[key];
  }

  getAllKeys() {
    return Object.keys(this.storage);
  }

  clearAll() {
    this.storage = {};
  }
}

export const MMKV = MockMMKV;
export default {MMKV: MockMMKV};
