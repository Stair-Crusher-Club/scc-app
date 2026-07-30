/**
 * 윌리의 외출 인트로 팝업을 이 유저가 이미 봤는지 판정한다.
 *
 * 노출 기준은 **기기가 아니라 유저**다 — 같은 기기에서 계정을 바꾸면(재가입/계정 전환) 새
 * 유저는 팝업을 한 번 봐야 하고, 같은 계정으로 다시 로그인하면 봐선 안 된다.
 *
 * @param userId 현재 로그인한 유저 id. 로그인 전(null)이면 판정 자체가 무의미하므로 "안 봤다"로
 *   두고, 실제 노출 여부는 호출부의 익명 사용자 조건이 따로 거른다.
 * @param shownUserId 팝업을 본 것으로 기록된 유저 id (`tutorialIntroPopupShownUserIdAtom`).
 * @param legacyShown 기기 단위 boolean 이던 구버전 기록 (`hasShownTutorialIntroPopupAtom`).
 *   `shownUserId` 가 아직 없을 때만 유효하다 — 업데이트 직후 전 유저에게 전면 팝업이 다시 뜨는
 *   것을 막기 위한 이관용이며, 호출부가 이 값을 현재 유저에게 1회 귀속시킨다.
 */
export function hasSeenTutorialIntroPopup({
  userId,
  shownUserId,
  legacyShown,
}: {
  userId: string | null;
  shownUserId: string | null;
  legacyShown: boolean;
}): boolean {
  if (userId == null) {
    return false;
  }
  if (shownUserId != null) {
    return shownUserId === userId;
  }
  return legacyShown;
}
