import {storage} from '@/atoms/atomForLocal';
import {atom} from 'jotai';

const STORAGE_KEY = 'deferred-deep-link-url';

/**
 * MMKV 기반 deferred deep link atom.
 * RootScreen 콜백에서는 setDeferredDeepLinkUrl()로 MMKV에 직접 쓰고,
 * React 컴포넌트에서는 이 atom을 useAtomValue로 읽는다.
 */
export const deferredDeepLinkAtom = atom(
  () => storage.getString(STORAGE_KEY) ?? null,
);

/** RootScreen 콜백(비-React 컨텍스트)에서 사용 */
export function setDeferredDeepLinkUrl(url: string | null) {
  if (url) {
    storage.set(STORAGE_KEY, url);
  } else {
    storage.delete(STORAGE_KEY);
  }
}
