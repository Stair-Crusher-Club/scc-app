import {featureFlagAtom} from '@/atoms/Auth';
import {useAtomValue} from 'jotai';

/**
 * QA 모드 여부를 확인합니다.
 * QA 모드에서는 상세(v1) → 등록(v2) 조합으로 동작합니다.
 *
 * userInfo의 REGISTER_ACCESSIBILITY_V2 플래그를 체크합니다.
 *
 * @returns QA 모드 활성화 여부
 */
export const useIsQAMode = (): boolean => {
  const featureFlag = useAtomValue(featureFlagAtom);
  return featureFlag?.isRegisterAccessibilityV2 ?? false;
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
 * - QA 모드: v2
 * - 일반 모드: v1
 * @returns 'v1' 또는 'v2'
 */
export const useFormScreenVersion = (): 'v1' | 'v2' => {
  const qaMode = useIsQAMode();

  return qaMode ? 'v2' : 'v1';
};
