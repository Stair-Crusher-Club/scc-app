/**
 * PlaceList 기능 활성화 여부를 확인합니다.
 * Feature flag 제거로 항상 true를 반환합니다.
 */
export const useIsPlaceListEnabled = (): boolean => {
  return true;
};

/**
 * PlaceDetail V2 (탭 기반 PDP) 활성화 여부를 확인합니다.
 * Feature flag 제거로 항상 true를 반환합니다.
 */
export const useIsPlaceDetailV2 = (): boolean => {
  return true;
};

/**
 * Feature flag에 따라 PlaceDetail 화면 이름을 반환합니다.
 * 네비게이션 호출 시 사용: navigation.navigate(pdpScreen, params)
 * Feature flag 제거로 항상 'PlaceDetailV2'를 반환합니다.
 */
export const usePlaceDetailScreenName = () => {
  return 'PlaceDetailV2' as const;
};
