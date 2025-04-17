import {atomWithStorage} from 'jotai/utils';
import {SyncStorage} from 'jotai/vanilla/utils/atomWithStorage';
import {MMKV} from 'react-native-mmkv';

import {parseOrNull} from '@/utils/JSON';

export const storage = new MMKV();
export function atomForLocal<T>(atomKey: string) {
  const valueStore: SyncStorage<T | null> = {
    getItem: key => {
      const value = storage.getString(key);
      return value ? parseOrNull(value) : null;
    },
    setItem: (key, value) => {
      storage.set(key, JSON.stringify(value));
    },
    removeItem: key => {
      storage.delete(key);
    },
  };
  return atomWithStorage<T | null>(atomKey, null, valueStore);
}

export function atomForLocalNonNull<T>(atomKey: string, defaultValue: T) {
  const valueStore: SyncStorage<T> = {
    getItem: key => {
      const value = storage.getString(key);
      return value ? parseOrNull(value) : defaultValue;
    },
    setItem: (key, value) => {
      storage.set(key, JSON.stringify(value));
    },
    removeItem: key => {
      storage.delete(key);
    },
  };
  return atomWithStorage<T>(atomKey, defaultValue, valueStore, {
    getOnInit: true,
  });
}
