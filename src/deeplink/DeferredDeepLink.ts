let deferredUrl: string | null = null;

export function getDeferredDeepLinkUrl(): string | null {
  return deferredUrl;
}

export function setDeferredDeepLinkUrl(url: string | null) {
  deferredUrl = url;
}
