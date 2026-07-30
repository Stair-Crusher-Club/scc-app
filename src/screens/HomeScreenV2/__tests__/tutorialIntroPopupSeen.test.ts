import {describe, expect, it} from '@jest/globals';

import {hasSeenTutorialIntroPopup} from '@/screens/HomeScreenV2/tutorialIntroPopupSeen';

describe('hasSeenTutorialIntroPopup', () => {
  const A = 'user-a';
  const B = 'user-b';

  it('기록이 없는 유저는 아직 안 본 것이다', () => {
    expect(
      hasSeenTutorialIntroPopup({
        userId: A,
        shownUserId: null,
        legacyShown: false,
      }),
    ).toBe(false);
  });

  it('본 유저로 기록돼 있으면 다시 보지 않는다', () => {
    expect(
      hasSeenTutorialIntroPopup({
        userId: A,
        shownUserId: A,
        legacyShown: false,
      }),
    ).toBe(true);
  });

  // 이 버그 때문에 수정했다: 기기 단위 boolean 이던 시절엔 계정을 바꿔도 true 로 남아
  // 새 유저가 인트로 팝업을 영영 못 봤다.
  it('다른 유저가 본 기록은 현재 유저에게 적용되지 않는다', () => {
    expect(
      hasSeenTutorialIntroPopup({
        userId: B,
        shownUserId: A,
        legacyShown: true,
      }),
    ).toBe(false);
  });

  it('같은 계정으로 재로그인하면 다시 보지 않는다', () => {
    expect(
      hasSeenTutorialIntroPopup({
        userId: A,
        shownUserId: A,
        legacyShown: true,
      }),
    ).toBe(true);
  });

  // 구버전 이관: userId 기록이 생기기 전 한정으로 기기 단위 기록을 인정한다.
  // (인정하지 않으면 업데이트 직후 기존 유저 전원에게 전면 팝업이 다시 뜬다.)
  it('userId 기록 이전에는 구버전 기기 기록을 인정한다', () => {
    expect(
      hasSeenTutorialIntroPopup({
        userId: A,
        shownUserId: null,
        legacyShown: true,
      }),
    ).toBe(true);
  });

  it('로그인 전에는 판정하지 않는다', () => {
    expect(
      hasSeenTutorialIntroPopup({
        userId: null,
        shownUserId: A,
        legacyShown: true,
      }),
    ).toBe(false);
  });
});
