import {DEEP_LINK_PREFIXES} from '@/navigation/linkingConfig';

/**
 * URL에서 딥링크 prefix를 제거하고 path+query 부분만 반환
 */
export function stripPrefix(url: string): string | null {
  for (const prefix of DEEP_LINK_PREFIXES) {
    if (url.toLowerCase().startsWith(prefix.toLowerCase())) {
      return url.slice(prefix.length);
    }
  }
  return null;
}

/**
 * URL이 앱 내부 딥링크인지 확인
 */
export function isAppDeepLink(url: string): boolean {
  return DEEP_LINK_PREFIXES.some(prefix =>
    url.toLowerCase().startsWith(prefix.toLowerCase()),
  );
}

/**
 * URL의 queryParam에 authDeferred=true가 있는지 확인
 */
export function isAuthDeferred(url: string): boolean {
  const qIdx = url.indexOf('?');
  if (qIdx === -1) {
    return false;
  }
  const params = new URLSearchParams(url.slice(qIdx));
  return params.get('authDeferred') === 'true';
}
