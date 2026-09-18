import {QueryClient} from '@tanstack/react-query';

/**
 * 접근성 등록/삭제로 챌린지 기여·정복 수가 바뀌었을 때 갱신해야 하는 캐시들.
 *
 * 이 화면들은 PDP 를 띄워도 스택에 마운트된 채 남아 있어 되돌아와도 refetch 가 돌지
 * 않는다 — 등록 시점에 무효화하지 않으면 방금 정복한 장소가 계속 미정복으로 보이고
 * 진척 숫자도 그대로다. prefix 매칭이라 challengeId·필터·좌표가 붙은 키까지 한 번에 잡는다.
 */
export function invalidateChallengeQueries(queryClient: QueryClient) {
  // 남은 매장 보기 (리스트/지도 공용 쿼리)
  queryClient.invalidateQueries({queryKey: ['ChallengeConquerTargetPlaces']});
  // 챌린지 상세 진척도
  queryClient.invalidateQueries({queryKey: ['ChallengeDetail']});
  // 홈 진척 카드 — staleTime 5분이라 무효화 없이는 확실히 옛 숫자가 남는다.
  queryClient.invalidateQueries({queryKey: ['HomeScreenData']});
}
