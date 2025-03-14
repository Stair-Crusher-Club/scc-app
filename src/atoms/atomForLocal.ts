import {MMKV} from 'react-native-mmkv';
import {atom} from 'recoil';

import {parseOrNull} from '@/utils/JSON';

export const storage = new MMKV();
export function atomForLocal<T>(key: string) {
  const defaultStr = storage.getString(key);
  let defaultValue = null;
  if (defaultStr) {
    defaultValue = parseOrNull(defaultStr);
  }
  return atom<T | null>({
    key,
    default: defaultValue,
    effects: [localStorageSync<T>(key)],
  });
}

export function atomForLocalNonNull<T>(key: string, defaultValue: T) {
  const defaultStr = storage.getString(key);
  let value = null;
  if (defaultStr) {
    value = parseOrNull(defaultStr);
  } else {
    value = defaultValue;
  }
  return atom<T>({
    key,
    default: value,
    effects: [localStorageSync<T>(key)],
  });
}

const localStorageSync = <T>(storageKey: string) => {
  return ({setSelf, onSet}: any) => {
    onSet((newValue: T | null) => {
      if (newValue) {
        storage.set(storageKey, JSON.stringify(newValue));
      } else {
        storage.delete(storageKey);
      }
    });
    const value = storage.getString(storageKey);
    if (value) {
      setSelf(parseOrNull(value));
    }
  };
};
