import Config from 'react-native-config';

/**
 * 접근성 관련 화면 버전을 반환합니다.
 *
 * - 'v2': 새로운 PlaceDetailV2Screen, PlaceFormV2Screen, BuildingFormV2Screen 사용
 * - 그 외 (기본값 'v1'): 기존 PlaceDetailScreen, PlaceFormScreen, BuildingFormScreen 사용
 *
 * @returns 'v1' (기본값) 또는 'v2'
 */
export const getAccessibilityVersion = (): 'v1' | 'v2' => {
  const isDebug = Config.DEBUG;
  if (isDebug) {
    // FIXME
    return 'v2';
  }

  const version = Config.ACCESSIBILITY_VERSION;
  return version === 'v2' ? 'v2' : 'v1';
};
