import {FlatList, ScrollView} from 'react-native';

/**
 * 앱 시작 시 호출. 전역 기본 동작을 설정한다.
 * App.tsx 최상단에서 1회 호출.
 */
export function setupGlobalFeatures() {
  // 키보드가 열린 상태에서 ScrollView/FlatList 내부 탭이 자식(버튼/input)으로 항상 전달되도록.
  // 'handled'는 일부 케이스에서 첫 탭을 "키보드 닫기"로만 소비하고 자식에 전달하지 못한다.
  // 'always'는 자식이 항상 탭을 받음(버튼들은 자체적으로 Keyboard.dismiss()를 호출하므로 닫기는 유지).
  (ScrollView as any).defaultProps = {
    ...(ScrollView as any).defaultProps,
    keyboardShouldPersistTaps: 'always',
  };
  (FlatList as any).defaultProps = {
    ...(FlatList as any).defaultProps,
    keyboardShouldPersistTaps: 'always',
  };
}
