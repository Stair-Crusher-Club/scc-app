/**
 * 외부 설문 폼 URL 에 `{userId}` placeholder 가 있을 경우 실제 userId 로 치환한다.
 *
 * 배너 / 딥링크 등에서 ops 가 `https://forms.staircrusher.club/feedback?userId={userId}`
 * 형식으로 URL 을 적어두면, WebView 진입 시 클라이언트가 자동으로 userId 를 주입해
 * 설문 응답에 사용자 식별값이 함께 수집되도록 한다.
 *
 * 화이트리스트 도메인에 한해 동작하며, 그 외 URL 은 원본을 그대로 반환한다.
 */

const FORM_TEMPLATE_DOMAIN_MATCHERS: Array<(host: string) => boolean> = [
  host => host === 'forms.staircrusher.club',
  host => host === 'tally.so' || host.endsWith('.tally.so'),
];

export function isTemplatedExternalUrl(url: string): boolean {
  try {
    const host = new URL(url).host;
    return FORM_TEMPLATE_DOMAIN_MATCHERS.some(match => match(host));
  } catch {
    return false;
  }
}

export function resolveTemplatedExternalUrl(
  url: string,
  ctx: {userId: string | undefined},
): string {
  if (!isTemplatedExternalUrl(url)) {
    return url;
  }
  if (!ctx.userId) {
    return url;
  }
  return url.replace(/\{userId\}/g, encodeURIComponent(ctx.userId));
}
