import {describe, expect, it} from '@jest/globals';

import {shouldShowDailyLoginPrompt} from './shouldShowDailyLoginPrompt';

const base = {
  inAppWebView: false,
  loggedIn: false,
  sessionStarted: false,
  pathname: '/',
  today: '2026-07-07',
  lastShownDate: null as string | null,
};

describe('shouldShowDailyLoginPrompt', () => {
  it('미식별 web + 오늘 미노출 → 노출', () => {
    expect(shouldShowDailyLoginPrompt(base)).toBe(true);
  });

  it.each(['/login', '/signup', '/oauth/kakao', '/oauth/apple'])(
    '인증 페이지(%s)에서는 스킵',
    pathname => {
      expect(shouldShowDailyLoginPrompt({...base, pathname})).toBe(false);
    },
  );

  it('오늘 이미 노출(today === lastShownDate) → 스킵', () => {
    expect(
      shouldShowDailyLoginPrompt({...base, lastShownDate: '2026-07-07'}),
    ).toBe(false);
  });

  it('앱 in-app WebView → 스킵', () => {
    expect(shouldShowDailyLoginPrompt({...base, inAppWebView: true})).toBe(
      false,
    );
  });

  it('식별(로그인) 유저 → 스킵', () => {
    expect(shouldShowDailyLoginPrompt({...base, loggedIn: true})).toBe(false);
  });

  it('세션 내 이동(sessionStarted) → 스킵 (오늘 미노출이어도)', () => {
    expect(shouldShowDailyLoginPrompt({...base, sessionStarted: true})).toBe(
      false,
    );
  });

  it('세션 내 이동이 자정을 넘겨도(어제 노출됨) → 스킵', () => {
    expect(
      shouldShowDailyLoginPrompt({
        ...base,
        sessionStarted: true,
        lastShownDate: '2026-07-06',
      }),
    ).toBe(false);
  });
});
