/**
 * 앱 내부 딥링크 prefix 목록
 * RootScreen.tsx의 linking.prefixes와 동기화 필요
 */
const DEEP_LINK_PREFIXES = [
  'stair-crusher://',
  'https://scc.airbridge.io/',
  'https://app.staircrusher.club/',
  'https://link.staircrusher.club/',
];

/**
 * URL이 앱 내부 딥링크인지 확인
 * @param url 확인할 URL
 * @returns 앱 내부 딥링크 여부
 */
export function isAppDeepLink(url: string): boolean {
  return DEEP_LINK_PREFIXES.some(prefix =>
    url.toLowerCase().startsWith(prefix.toLowerCase()),
  );
}
