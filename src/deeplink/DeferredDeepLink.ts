import {storage} from '@/atoms/atomForLocal';

const STORAGE_KEY = 'deferred-deep-link-url';

export function getDeferredDeepLinkUrl(): string | null {
  return storage.getString(STORAGE_KEY) ?? null;
}

export function setDeferredDeepLinkUrl(url: string | null) {
  if (url) {
    storage.set(STORAGE_KEY, url);
  } else {
    storage.delete(STORAGE_KEY);
  }
}
