import {Animated, StyleSheet} from 'react-native';
import styled from 'styled-components/native';

import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const Header = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  padding: 10,
});

export const CancelButton = styled.Text({
  color: 'white',
  fontFamily: font.pretendardRegular,
  fontSize: 18,
  padding: 12,
});

export const SubmitButton = styled.Text(({disabled}: {disabled?: boolean}) => ({
  color: color.lightOrange,
  fontFamily: font.pretendardRegular,
  fontSize: 18,
  padding: 12,
  opacity: disabled ? 0.3 : 1,
}));

export const CameraContainer = styled.View<{maxHeight?: number}>(
  ({maxHeight}) => ({
    width: '100%',
    maxHeight: maxHeight,
    backgroundColor: 'black',
    alignItems: 'center',
  }),
);

export const CameraPreviewContainer = styled.View({
  width: '100%',
  height: '100%',
  overflow: 'hidden', // For fixing camera layout issue https://github.com/mrousavy/react-native-vision-camera/issues/3237#issuecomment-2567232998
  aspectRatio: '1 / 1',
});

export const TipsWrapper = styled.View({
  marginVertical: 20,
  marginHorizontal: 20,
  alignItems: 'flex-start',
});

const DOOR_FRAME_WIDTH = 142;

// Figma(Frame 390): 슬롯 3칸, 간격 16.
// 간격을 컨테이너의 gap 으로 주면 (a) FlatList contentContainer gap, (b) 플레이스홀더 행의
// gap, (c) 촬영분↔플레이스홀더 경계 가 서로 독립적으로 계산돼 경계에서 이중으로 붙는다.
// 그래서 **슬롯마다 좌우 8씩** 준다 — 인접 슬롯은 항상 8+8=16, 바깥쪽도 좌우 대칭이라
// 촬영 장수가 바뀌어도 가운데 정렬이 흔들리지 않는다. X 버튼(top/right -4)도 이 여백 안에 들어간다.
const PHOTO_SLOT_GAP = 16;

// Figma: select_exist 45x45, camera-btn 28x28
export const SIDE_BUTTON_SIZE = 45;
export const SIDE_BUTTON_ICON_SIZE = 28;

// 0장 상태: 문 프레임 안내(세로 점선 사각형 + 좌우 지면 점선). 에셋 없이 dashed View로 구현.
// Figma(123:4012, 844 높이 기준): 프리뷰(407) 안에서 top 98px(24%)/bottom 57px(14%)만
// 차지 — 프리뷰 전체를 채우지 않는다.
export const DoorFrameOverlay = styled.View({
  position: 'absolute',
  top: '24%',
  bottom: '14%',
  left: 0,
  right: 0,
  justifyContent: 'center',
  alignItems: 'center',
});

export const DoorFrameRect = styled.View({
  width: DOOR_FRAME_WIDTH,
  height: '100%',
  borderWidth: 2,
  borderStyle: 'dashed',
  borderColor: 'white',
  // Figma(113:5050): fill #FFFFFF @ 0.4 — 문 안쪽이 채워져 있다.
  backgroundColor: 'rgba(255, 255, 255, 0.4)',
});

// Figma(113:5048/5049): y=467 에 좌 123px / 우 124px 점선. 높이 0 인 순수 선이다.
// RN 의 `borderTopWidth + borderStyle:'dashed'` 는 4변이 균일하지 않으면 안드로이드에서
// 렌더되지 않아 선이 아예 안 보였다 → SVG Line 으로 그린다(문 프레임 사각형은 4변
// 균일해서 dashed 가 정상 동작하므로 그대로 둔다).
export const DoorFrameGroundLineLeft = styled.View({
  position: 'absolute',
  left: 0,
  right: '50%',
  marginRight: DOOR_FRAME_WIDTH / 2,
  bottom: 0,
  height: 2,
});

export const DoorFrameGroundLineRight = styled.View({
  position: 'absolute',
  right: 0,
  left: '50%',
  marginLeft: DOOR_FRAME_WIDTH / 2,
  bottom: 0,
  height: 2,
});

export const OverlayCaption = styled.Text({
  position: 'absolute',
  top: '50%',
  left: 24,
  right: 24,
  color: 'white',
  fontFamily: font.pretendardMedium,
  fontSize: 15,
  lineHeight: 22,
  textAlign: 'center',
  // Figma(113:5051/113:5526): DROP_SHADOW radius 4 / #000000 0.9 / offset(0,0) 3겹.
  // RN Text 는 textShadow 를 1겹만 지원하므로 동일 파라미터로 근사한다.
  textShadowColor: 'rgba(0, 0, 0, 0.9)',
  textShadowOffset: {width: 0, height: 0},
  textShadowRadius: 4,
});

// 1장 상태: 계단/경사로 3D 안내. Figma: 캡션 y=188(46%), SVG y=238(58%)~348(85.5%) — 프리뷰(407) 기준.
export const StairsOverlay = styled.View({
  position: 'absolute',
  top: '46%',
  left: 0,
  right: 0,
  alignItems: 'center',
  gap: 6,
});

export const StairsOverlayCaption = styled.Text({
  color: 'white',
  fontFamily: font.pretendardMedium,
  fontSize: 15,
  lineHeight: 22,
  textAlign: 'center',
  paddingHorizontal: 24,
  // Figma(113:5051/113:5526): DROP_SHADOW radius 4 / #000000 0.9 / offset(0,0) 3겹.
  // RN Text 는 textShadow 를 1겹만 지원하므로 동일 파라미터로 근사한다.
  textShadowColor: 'rgba(0, 0, 0, 0.9)',
  textShadowOffset: {width: 0, height: 0},
  textShadowRadius: 4,
});

export const Tips = styled(SccPressable)({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
  paddingVertical: 6,
  paddingLeft: 8,
  paddingRight: 16,
  backgroundColor: color.blacka40,
  borderRadius: 30,
});

export const Tip = styled.Text({
  color: 'white',
  fontFamily: font.pretendardMedium,
  fontSize: 16,
});

// 썸네일 행은 섹션 최상단에 고정하고, 안내 문구는 absolute 로 띄운다.
// 문구가 자리를 차지하면(이전 구현) 좁은 화면에서 섹션(flex:1)이 필요 높이보다 작아져
// 썸네일 행이 압축되고 아래쪽이 잘렸다 — iPhone 기준 이 섹션에 87px 정도만 남는다.
export const TakenPhotosSection = styled.View({
  flex: 1,
  justifyContent: 'flex-start',
  paddingTop: 8,
});

export const TakenPhotos = styled.View({
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  // 56(슬롯) + 6*2(FlatList contentContainer paddingVertical). 압축되면 잘리므로 고정한다.
  height: 68,
  flexShrink: 0,
});

// 썸네일 행(68) 아래에 absolute 로 놓는다 — 레이아웃 높이를 차지하지 않으므로
// 문구 유무가 썸네일 행 위치에 영향을 주지 않고, 섹션을 압축시키지도 않는다.
// Figma(113:5059)는 "최대 N장까지 촬영할 수 있어요" **한 줄**이다. 음량 버튼 안내를
// 둘째 줄로 덧붙였더니 좁은 화면에서 버튼 영역까지 내려와 겹쳤다.
export const PhotoCaption = styled.Text({
  position: 'absolute',
  top: 8 + 68 + 8,
  left: 0,
  right: 0,
  color: 'white',
  fontFamily: font.pretendardRegular,
  fontSize: 14,
  textAlign: 'center',
  lineHeight: 20,
});

export const PlaceholderRow = styled.View({
  flexDirection: 'row',
});

export const PlaceholderSlot = styled.View({
  marginHorizontal: PHOTO_SLOT_GAP / 2,
  width: 56,
  height: 56,
  // Figma(113:5063 selector): cornerRadius 8, fill #FFFFFF + 노드 opacity 0.2.
  borderRadius: 8,
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  overflow: 'hidden',
});

export const PlaceholderImage = styled.Image({
  width: '100%',
  height: '100%',
});

export const TakenPhotoItem = styled(SccPressable)({
  marginHorizontal: PHOTO_SLOT_GAP / 2,
});

export const Thumbnail = styled.Image({
  backgroundColor: color.gray20,
  // Figma(selector): cornerRadius 8
  borderRadius: 8,
  width: 56,
  height: 56,
  overflow: 'hidden',
});
export const CloseButton = styled(SccPressable).attrs({hitSlop: 10})({
  position: 'absolute',
  top: -4,
  right: -4,
});

export const ActionsWrapper = styled.View({
  // paddingHorizontal 을 두면 absolute 자식(SideButton)의 left/right 기준이 padding
  // edge 로 밀려 Figma 좌표와 어긋난다. 촬영 버튼만 flow 에 있으므로 padding 불필요.
  justifyContent: 'center',
  alignItems: 'flex-start',
  flexDirection: 'row',
  marginVertical: 24,
  // 촬영 버튼 78 + 스택이 2px 더 내려오는 만큼(top 11 + 69)
  height: 80,
  position: 'relative',
});

export const CaptureButton = styled(SccPressable)(props => ({
  width: 78,
  height: 78,
  backgroundColor: 'transparent',
  borderRadius: 39,
  borderColor: 'white',
  borderStyle: 'solid',
  borderWidth: 4,
  justifyContent: 'center',
  alignItems: 'center',
  opacity: props.disabled ? 0.3 : 1,
}));

export const CaptureInnerDeco = styled.View({
  width: 65,
  height: 65,
  borderRadius: 32.5,
  backgroundColor: 'white',
});

// 하단 기능 버튼(앨범/가이드/플래시/타이머). Figma(123:4012 Frame 1261159834):
// 원 45x45(#000000 0.4) + gap 6 + 라벨 13/lh18 = 스택 45x69.
// 촬영 버튼(Group 501, 78x78 @y=202)보다 스택(y=213)이 11px 아래에서 시작한다.
// 치수는 이 셸 한 곳에만 둔다 — 버튼별로 복제하지 않는다.
export const SideButton = styled(SccPressable)<{
  left?: number;
  right?: number;
  // ⚠️ `disabled` 라는 이름을 쓰면 styled-components 가 그대로 Pressable 로 넘겨
  // onPress 가 아예 호출되지 않는다 — 앨범 비활성 시 안내 토스트가 안 뜨던 원인.
  // 스타일 전용 prop 이므로 이름을 분리한다.
  isDimmed?: boolean;
}>(({left, right, isDimmed}) => ({
  position: 'absolute',
  top: 11,
  left,
  right,
  width: SIDE_BUTTON_SIZE,
  alignItems: 'center',
  gap: 6,
  opacity: isDimmed ? 0.4 : 1,
}));

export const SideButtonCircle = styled.View({
  width: SIDE_BUTTON_SIZE,
  height: SIDE_BUTTON_SIZE,
  borderRadius: SIDE_BUTTON_SIZE / 2,
  backgroundColor: color.blacka40,
  alignItems: 'center',
  justifyContent: 'center',
});

export const SideButtonLabel = styled.Text<{isOn?: boolean}>(({isOn}) => ({
  color: isOn ? color.yellow : 'white',
  fontFamily: font.pretendardRegular,
  fontSize: 13,
  lineHeight: 18,
  textAlign: 'center',
}));

// Figma(Frame 507): 툴팁 50px 높이가 y=160~210, 버튼 스택 top 은 y=213.
// ActionsWrapper top = 촬영 버튼 top(202) 이므로 툴팁 top = 202-42.
export const TooltipAnchor = styled(Animated.View)({
  position: 'absolute',
  left: 0,
  right: 0,
  top: -42,
});

export const CountdownOverlay = styled.View({
  ...StyleSheet.absoluteFillObject,
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  justifyContent: 'center',
  alignItems: 'center',
});

export const CountdownText = styled.Text({
  color: 'white',
  fontFamily: font.pretendardBold,
  fontSize: 96,
  textAlign: 'center',
});

export const AlbumLoadingOverlay = styled.View({
  ...StyleSheet.absoluteFillObject,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 16,
});

export const AlbumLoadingText = styled.Text({
  color: 'white',
  fontFamily: font.pretendardRegular,
  fontSize: 14,
  textAlign: 'center',
  lineHeight: 20,
});
