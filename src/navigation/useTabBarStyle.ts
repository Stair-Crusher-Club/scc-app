import {Platform} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

/**
 * 라벨 아래 여백 (Figma). 탭 아이템 내부는 위쪽 정렬(`justifyContent: 'flex-start'`)이라
 * 늘린 높이가 그대로 라벨 아래 여백이 된다.
 */
export const TAB_BAR_LABEL_BOTTOM_GAP = 12;

/**
 * react-navigation 의 기본 탭바 콘텐츠 높이(`TABBAR_HEIGHT_UIKIT`).
 * 라이브러리 내부 상수라 export 되지 않아 값을 복제한다 — 버전 업 시 확인 필요.
 */
const DEFAULT_TAB_BAR_CONTENT_HEIGHT = 49;

/**
 * 탭바 스타일의 **단일 소스**. `MainScreen` 의 navigator 기본값과, 탭바를 자체적으로
 * 덮어쓰는 화면(`SearchScreen` 의 빈 지도 오버레이)이 반드시 이걸 공유해야 한다.
 * 화면마다 높이가 달라지면 탭바 자체는 물론, `useBottomTabBarHeight()` 로 하단 여백을
 * 잡는 UI(지도 플로팅 버튼 등)까지 그 화면에서만 어긋난다.
 */
export function useTabBarStyle() {
  const insets = useSafeAreaInsets();

  // 웹은 기본 높이(49px)로도 아이콘+라벨이 잘려 내용에 맞게 늘려 쓴다. (앱 미영향)
  if (Platform.OS === 'web') {
    return {height: 'auto' as const};
  }

  return {
    height:
      DEFAULT_TAB_BAR_CONTENT_HEIGHT + insets.bottom + TAB_BAR_LABEL_BOTTOM_GAP,
  };
}
