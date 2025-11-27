import { featureFlagAtom } from '@/atoms/Auth';
import { getDefaultStore } from 'jotai';
import Config from 'react-native-config';

/**
 * QA 모드 여부를 확인합니다.
 * QA 모드에서는 상세(v1) → 등록(v2) 조합으로 동작합니다.
 *
 * userInfo의 REGISTER_ACCESSIBILITY_V2 플래그를 체크합니다.
 *
 * @returns QA 모드 활성화 여부
 */
export const isQAMode = (): boolean => {
  const store = getDefaultStore();
  const featureFlag = store.get(featureFlagAtom);
  return featureFlag?.isRegisterAccessibilityV2 ?? false;
};

/**
 * 접근성 관련 화면 버전을 반환합니다.
 *
 * - 'v2': 새로운 PlaceDetailV2Screen, PlaceFormV2Screen, BuildingFormV2Screen 사용
 * - 그 외 (기본값 'v1'): 기존 PlaceDetailScreen, PlaceFormScreen, BuildingFormScreen 사용
 *
 * @returns 'v1' (기본값) 또는 'v2'
 */
export const getAccessibilityVersion = (): 'v1' | 'v2' => {
  const version = Config.ACCESSIBILITY_VERSION;
  return version === 'v2' ? 'v2' : 'v1';
};

/**
 * 상세 화면 버전을 결정합니다.
 * - QA 모드: 항상 v1
 * - 일반 모드: getAccessibilityVersion() 따름
 *
 * 사용처: 카드 클릭 시, 등록 완료 후 상세로 돌아갈 때
 *
 * @returns 'v1' 또는 'v2'
 */
export const getDetailScreenVersion = (): 'v1' | 'v2' => {
  if (isQAMode()) {
    return 'v1';
  }
  return getAccessibilityVersion();
};

/**
 * 등록 화면 버전을 결정합니다.
 * - QA 모드: 항상 v2
 * - 일반 모드: getAccessibilityVersion() 따름
 *
 * 사용처: 상세 화면에서 등록 화면으로 이동할 때
 *
 * @returns 'v1' 또는 'v2'
 */
export const getFormScreenVersion = (): 'v1' | 'v2' => {
  if (isQAMode()) {
    return 'v2';
  }
  return getAccessibilityVersion();
};
