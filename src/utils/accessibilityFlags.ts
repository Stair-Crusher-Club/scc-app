import Config from 'react-native-config';

/**
 * 접근성 관련 화면 버전을 반환합니다.
 *
 * 환경변수 ACCESSIBILITY_VERSION을 확인합니다:
 * - 'v2': 새로운 PlaceDetailV2Screen, PlaceFormV2Screen, BuildingFormV2Screen 사용
 * - 그 외 (기본값 'v1'): 기존 PlaceDetailScreen, PlaceFormScreen, BuildingFormScreen 사용
 *
 * 프로덕션에서는 기본값('v1')이 사용되며, 개발 환경에서만 환경변수로 제어 가능합니다.
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
