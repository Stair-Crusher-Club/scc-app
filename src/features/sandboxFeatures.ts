import {FlatList, ScrollView} from 'react-native';
import Config from 'react-native-config';

/**
 * Sandbox 전용 기능 플래그 레지스트리
 *
 * - production 빌드에서는 모든 플래그가 자동 비활성화
 * - sandbox/local에서만 각 플래그의 enabled 값에 따라 동작
 * - 새 QA 기능 추가 시 여기에 플래그 등록
 */
const SANDBOX_FEATURES = {} as const;

type FeatureKey = keyof typeof SANDBOX_FEATURES;

export function isFeatureEnabled(key: FeatureKey): boolean {
  if (Config.FLAVOR === 'production') return false;
  return SANDBOX_FEATURES[key];
}

/**
 * 앱 시작 시 호출. global 설정을 적용한다.
 * App.tsx 최상단에서 1회 호출.
 */
export function setupGlobalFeatures() {
  // 키보드가 열린 상태에서 ScrollView/FlatList 내부 탭이 자식 컴포넌트로 전달되도록
  (ScrollView as any).defaultProps = {
    ...(ScrollView as any).defaultProps,
    keyboardShouldPersistTaps: 'handled',
  };
  (FlatList as any).defaultProps = {
    ...(FlatList as any).defaultProps,
    keyboardShouldPersistTaps: 'handled',
  };
}
