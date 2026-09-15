import {useQuery} from '@tanstack/react-query';

import {useMe} from '@/atoms/Auth';
import {
  ChallengeStatusDto,
  ConquerTargetPlaceListDto,
} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import GeolocationUtils from '@/utils/GeolocationUtils';

const NEARBY_DISTANCE_METERS_LIMIT = 500;

export interface HomeCtplChallengeCard {
  challengeId: string;
  displayName: string;
  contributionsCount: number;
  goal: number;
  milestones: number[] | null | undefined;
}

/**
 * 홈 화면 "{displayName} 정복하기" 카드 + 툴팁에 필요한 데이터.
 * - 카드: 내가 참여 중이고 CTPL(정복 대상 장소 목록)이 연결된 진행중 챌린지 1개.
 *   복수면 최근 참여순 첫 개가 이상적이지만 목록 응답엔 참여 시각이 없어
 *   (ponytail: API 응답 순서상 첫 매치 — PROD엔 CTPL 챌린지가 1개뿐이라 실질 차이 없음.
 *   참여 시각 정렬이 필요해지면 서버에 joinedAt 필드 추가) 서버가 내려준 순서의 첫 매치를 쓴다.
 * - 툴팁: 카드가 있을 때만 반경 500m 내 미정복 CTPL 장소를 조회한다.
 */
export function useHomeCtplChallengeCard(): {
  challengeCard: HomeCtplChallengeCard | undefined;
  unconqueredTargetPlaceListNearby:
    | ConquerTargetPlaceListDto
    | null
    | undefined;
} {
  const {api} = useAppComponents();
  const {userInfo} = useMe();

  const {data: challengesData} = useQuery({
    queryKey: ['ListChallenges', 'InProgress'],
    queryFn: async () =>
      (
        await api.listChallengesPost({
          statuses: [ChallengeStatusDto.InProgress],
        })
      ).data,
  });

  const challengeCard: HomeCtplChallengeCard | undefined = (() => {
    const item = challengesData?.items.find(
      i => i.hasJoined && i.conquerTargetPlaceList != null,
    );
    if (!item || !item.conquerTargetPlaceList) {
      return undefined;
    }
    return {
      challengeId: item.id,
      displayName: item.conquerTargetPlaceList.displayName,
      contributionsCount: item.contributionsCount ?? 0,
      goal: item.goal ?? 0,
      milestones: item.milestones,
    };
  })();

  // 계정 전환 시 stale 되지 않도록 유저 식별자를 키에 포함한다.
  const {data: nearbyData} = useQuery({
    queryKey: ['HomeCtplUnconqueredNearby', userInfo?.id],
    queryFn: async () => {
      const currentPosition = await GeolocationUtils.getCurrentPosition();
      return (
        await api.getNearbyAccessibilityStatusPost({
          currentLocation: {
            lat: currentPosition.coords.latitude,
            lng: currentPosition.coords.longitude,
          },
          distanceMetersLimit: NEARBY_DISTANCE_METERS_LIMIT,
        })
      )?.data?.unconqueredTargetPlaceListNearby;
    },
    // 카드가 없으면(참여중인 CTPL 챌린지 없음) 툴팁도 뜰 수 없으니 조회하지 않는다.
    enabled: challengeCard != null,
  });

  return {
    challengeCard,
    unconqueredTargetPlaceListNearby: nearbyData,
  };
}
