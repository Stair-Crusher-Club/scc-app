import {FlatList, ScrollView} from 'react-native';

/**
 * 앱 시작 시 호출. 전역 기본 동작을 설정한다.
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
