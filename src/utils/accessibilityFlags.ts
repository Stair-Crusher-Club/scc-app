import {featureFlagAtom} from '@/atoms/Auth';
import {useAtomValue} from 'jotai';

/**
 * QA 모드 여부를 확인합니다.
 * QA 모드에서는 이미 접근성 정보가 등록된 장소에서도 중복 등록 버튼을 노출합니다.
 *
 * userInfo의 MULTIPLE_DOOR_REGISTRATION 플래그를 체크합니다 (hardcoded 유저만 해당).
 *
 * @returns QA 모드 활성화 여부
 */
export const useIsQAMode = (): boolean => {
  const featureFlag = useAtomValue(featureFlagAtom);
  return featureFlag?.isMultipleDoorRegistration ?? false;
};

/**
 * 상세 화면 버전을 결정합니다.
 * 항상 v1
 * @returns 'v1' 또는 'v2'
 */
export const useDetailScreenVersion = (): 'v1' | 'v2' => {
  return 'v1';
};

/**
 * 등록 화면 버전을 결정합니다.
 * - REGISTER_ACCESSIBILITY_V2 플래그 활성화: v2
 * - 일반 모드: v1
 * @returns 'v1' 또는 'v2'
 */
export const useFormScreenVersion = (): 'v1' | 'v2' => {
  const featureFlag = useAtomValue(featureFlagAtom);
  const isV2 = featureFlag?.isRegisterAccessibilityV2 ?? false;

  return isV2 ? 'v2' : 'v1';
};
