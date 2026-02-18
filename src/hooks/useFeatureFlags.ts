import {featureFlagAtom} from '@/atoms/Auth';
import {useAtomValue} from 'jotai';

/**
 * PlaceList 기능 활성화 여부를 확인합니다.
 * PLACE_LIST_ENABLED 플래그 활성화: SavedPlaceLists 화면 사용
 * 일반 모드: FavoritePlaces 화면 사용
 */
export const useIsPlaceListEnabled = (): boolean => {
  const featureFlag = useAtomValue(featureFlagAtom);
  return featureFlag?.isPlaceListEnabled ?? false;
};

/**
 * PlaceDetail V2 (탭 기반 PDP) 활성화 여부를 확인합니다.
 * PLACE_DETAIL_V2 플래그 활성화: PlaceDetailV2 화면 사용
 * 비활성화: 기존 PlaceDetail 화면 사용
 */
export const useIsPlaceDetailV2 = (): boolean => {
  // TODO: 디버깅용 강제 활성화 - 작업 완료 후 원복
  return true;
};

/**
 * Feature flag에 따라 PlaceDetail 화면 이름을 반환합니다.
 * 네비게이션 호출 시 사용: navigation.navigate(pdpScreen, params)
 */
export const usePlaceDetailScreenName = () => {
  const isV2 = useIsPlaceDetailV2();
  return isV2 ? ('PlaceDetailV2' as const) : ('PlaceDetail' as const);
};
