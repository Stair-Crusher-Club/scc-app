import type {DeepLinkIntent} from './DeferredDeepLink';

const DEEP_LINK_PREFIXES = [
  'stair-crusher://',
  'https://scc.airbridge.io/',
  'https://app.staircrusher.club/',
];

function stripPrefix(url: string): string | null {
  for (const prefix of DEEP_LINK_PREFIXES) {
    if (url.toLowerCase().startsWith(prefix.toLowerCase())) {
      return url.slice(prefix.length);
    }
  }
  return null;
}

export function resolveDeepLink(url: string): DeepLinkIntent | null {
  const pathAndQuery = stripPrefix(url);
  if (!pathAndQuery) {
    return null;
  }

  const [pathPart, queryPart] = pathAndQuery.split('?');
  const segments = pathPart.split('/').filter(Boolean);
  const queryParams = new URLSearchParams(queryPart ?? '');

  // challenge-join/:challengeId?passcode=XXX
  if (segments[0] === 'challenge-join' && segments[1]) {
    const challengeId = segments[1];
    const passcode = queryParams.get('passcode') ?? undefined;
    return {
      requiresAuth: true,
      screen: 'ChallengeDetail',
      params: {
        challengeId,
        autoJoinInfo: {passcode},
      },
    };
  }

  // 기존 deep links — React Navigation에 위임
  return null;
}
