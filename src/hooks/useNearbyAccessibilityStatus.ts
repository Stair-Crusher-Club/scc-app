import {useQuery} from '@tanstack/react-query';

import {useMe} from '@/atoms/Auth';
import {GetNearbyAccessibilityStatusPost200Response} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import GeolocationUtils from '@/utils/GeolocationUtils';

export const NEARBY_ACCESSIBILITY_STATUS_DISTANCE_METERS = 500;

/**
 * `getNearbyAccessibilityStatus` 응답을 **한 캐시에 모아두고** 소비처가 select 로 필요한
 * 필드만 뽑아 쓴다. 키/queryFn 을 소비처마다 따로 쓰면 같은 엔드포인트를 중복 호출한다 —
 * 실제로 홈 프리페치·검색 추천이 서로 다른 키로 호출하고 있었고, 프리페치가 채운 캐시는
 * 아무도 쓰지 않았다(키에 유저 식별자를 한쪽에만 추가하면서 갈라졌다).
 * (참여 챌린지 기준 CTPL 근접 여부는 이제 `getHomeScreenData` 의 `quickAction.challenge` 로
 * 옮겨갔다 — 카드가 고른 챌린지와 다른 챌린지의 반경을 판정하는 버그를 막기 위함.)
 *
 * 응답 필드는 유저별로 달라지므로 키에 유저 식별자를 포함한다.
 */
export function nearbyAccessibilityStatusQueryKey(userId: string | undefined) {
  return ['NearbyAccessibilityStatus', userId] as const;
}

type Api = ReturnType<typeof useAppComponents>['api'];

/**
 * 위치 권한이 없으면 null 을 돌려준다 — 이 정보는 부가적이라 화면을 에러로 만들지 않는다.
 * 서버는 값이 null 인 필드를 생략하므로(NON_ABSENT) 옵셔널 체이닝으로 읽고,
 * queryFn 이 undefined 를 반환하지 않도록 반드시 null 로 떨어뜨린다
 * (React Query 는 undefined 를 "Query data cannot be undefined" 에러로 취급한다).
 */
export function nearbyAccessibilityStatusQueryFn(api: Api) {
  return async (): Promise<GetNearbyAccessibilityStatusPost200Response | null> => {
    let currentPosition;
    try {
      currentPosition = await GeolocationUtils.getCurrentPosition();
    } catch {
      return null;
    }
    const result = await api.getNearbyAccessibilityStatusPost({
      currentLocation: {
        lat: currentPosition.coords.latitude,
        lng: currentPosition.coords.longitude,
      },
      distanceMetersLimit: NEARBY_ACCESSIBILITY_STATUS_DISTANCE_METERS,
    });
    return result?.data ?? null;
  };
}

function useNearbyAccessibilityStatus<T>(
  select: (data: GetNearbyAccessibilityStatusPost200Response | null) => T,
) {
  const {api} = useAppComponents();
  const {userInfo} = useMe();
  return useQuery({
    queryKey: nearbyAccessibilityStatusQueryKey(userInfo?.id),
    queryFn: nearbyAccessibilityStatusQueryFn(api),
    select,
  });
}

/** 반경 내 내가 정복한 장소 수. */
export function useNearbyConqueredCount() {
  return useNearbyAccessibilityStatus(data => data?.conqueredCount ?? 0);
}
