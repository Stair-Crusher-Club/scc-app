/**
 * QA 모드 여부를 확인합니다.
 * QA 모드에서는 이미 접근성 정보가 등록된 장소에서도 중복 등록 버튼을 노출합니다.
 *
 * Feature flag 제거로 항상 true를 반환합니다.
 *
 * @returns QA 모드 활성화 여부
 */
export const useIsQAMode = (): boolean => {
  return true;
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
 * Feature flag 제거로 항상 v2를 반환합니다.
 * @returns 'v1' 또는 'v2'
 */
export const useFormScreenVersion = (): 'v1' | 'v2' => {
  return 'v2';
};
