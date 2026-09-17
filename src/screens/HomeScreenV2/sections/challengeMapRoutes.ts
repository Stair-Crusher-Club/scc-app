/**
 * 홈 퀵액션에서 "남은 매장 보기(지도)"로 갈 때 쌓을 루트 스택 배열을 만든다.
 *
 * 퀵액션은 챌린지 상세를 건너뛰고 지도로 바로 가는데, 그러면 지도를 닫았을 때 홈으로
 * 떨어진다. 사용자가 기대하는 건 `홈 → 챌린지 상세 → 남은 매장 보기` 라서 상세를 아래에
 * 깔아준다. 두 번 navigate 하면 iOS 에서 2중 애니메이션이 나므로
 * (RegistrationCompleteScreen 의 CommonActions.reset 주석 참조) 단일 reset 으로 보낸다.
 */
export interface StackRoute {
  name: string;
  params?: object;
}

export function buildChallengeMapRoutes(
  currentRoutes: readonly StackRoute[],
  currentIndex: number,
  challengeId: string,
): StackRoute[] {
  return [
    // 현재 보고 있는 화면까지만 남긴다 — index 뒤쪽은 forward 히스토리라 버린다.
    ...currentRoutes.slice(0, currentIndex + 1),
    {name: 'ChallengeDetail', params: {challengeId}},
    {
      name: 'ChallengeConquerTargetPlaces',
      params: {challengeId, initialViewMode: 'map'},
    },
  ];
}
