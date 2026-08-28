import {Animated, StyleSheet} from 'react-native';
import styled from 'styled-components/native';

import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

// Figma(174:6978 Frame 506): 390x50. 좌우 컨테이너가 x=10 에서 시작하고 그 안에서
// 12 를 더 들여쓴다 → 화면 가장자리로부터 22.
export const Header = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: 50,
  paddingHorizontal: 10,
});

// Figma(174:6980 icon / close): 24x24 박스 안 글리프 14x14.
// close.svg 는 viewBox 16 에 글리프 14 라 16 으로 렌더하면 글리프가 Figma 와 같다.
export const HeaderCloseButton = styled(SccPressable).attrs({hitSlop: 8})({
  padding: 12,
});

export const SubmitButton = styled.Text(({disabled}: {disabled?: boolean}) => ({
  color: color.yellow70,
  fontFamily: font.pretendardRegular,
  fontSize: 18,
  lineHeight: 26,
  paddingHorizontal: 12,
  opacity: disabled ? 0.3 : 1,
}));

// Figma: 프리뷰는 화면 폭과 같은 정사각(390x390). 세로 공간이 부족한 기기에서는
// 프리뷰가 먼저 줄어들도록 flexShrink 를 준다 (다른 형제는 모두 고정 높이).
export const CameraContainer = styled.View({
  width: '100%',
  aspectRatio: 1,
  flexShrink: 1,
  backgroundColor: 'black',
  alignItems: 'center',
  overflow: 'hidden',
});

export const CameraPreviewContainer = styled.View({
  width: '100%',
  height: '100%',
  overflow: 'hidden', // For fixing camera layout issue https://github.com/mrousavy/react-native-vision-camera/issues/3237#issuecomment-2567232998
});

// Figma(174:6986): 칩은 프리뷰 **안쪽** 좌상단 (12,12).
export const TipsAnchor = styled.View({
  position: 'absolute',
  top: 12,
  left: 12,
});

const DOOR_FRAME_WIDTH = 142;

// Figma(Frame 390): 슬롯 3칸, 간격 16.
// 간격을 컨테이너의 gap 으로 주면 (a) FlatList contentContainer gap, (b) 플레이스홀더 행의
// gap, (c) 촬영분↔플레이스홀더 경계 가 서로 독립적으로 계산돼 경계에서 이중으로 붙는다.
// 그래서 **슬롯마다 좌우 8씩** 준다 — 인접 슬롯은 항상 8+8=16, 바깥쪽도 좌우 대칭이라
// 촬영 장수가 바뀌어도 가운데 정렬이 흔들리지 않는다. X 버튼(top/right -4)도 이 여백 안에 들어간다.
const PHOTO_SLOT_GAP = 16;

// 썸네일 행은 X 버튼 오버행을 위해 FlatList contentContainer 에 paddingVertical 6 을 주고
// 높이를 68(=56+6*2)로 고정한다. Figma 의 "슬롯 기준 위아래 20" 을 맞추려면 인접 마진에서
// 그 6 을 빼야 한다.
const PHOTO_ROW_OVERHANG = 6;
const SECTION_GAP = 20;

// Figma: select_exist 45x45, camera-btn 28x28
export const SIDE_BUTTON_SIZE = 45;
export const SIDE_BUTTON_ICON_SIZE = 28;

// 0장 상태: 문 프레임 안내(세로 점선 사각형 + 좌우 지면 점선). 에셋 없이 dashed View로 구현.
// Figma(174:6995, 프리뷰 390 기준): 문 프레임이 rel y 83..335 → top 21.3% / bottom 14.1%.
export const DoorFrameOverlay = styled.View({
  position: 'absolute',
  top: '21.3%',
  bottom: '14.1%',
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
  // Figma(174:6995): fill #FFFFFF @ 0.4 — 문 안쪽이 채워져 있다.
  backgroundColor: 'rgba(255, 255, 255, 0.4)',
});

// Figma(174:6993/6994): 문 프레임 하단과 같은 y 에 좌 123px / 우 124px 점선. 높이 0 인 순수 선이다.
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
  // Figma(174:6996): DROP_SHADOW radius 4 / #000000 0.9 / offset(0,0) 3겹.
  // RN Text 는 textShadow 를 1겹만 지원하므로 동일 파라미터로 근사한다.
  textShadowColor: 'rgba(0, 0, 0, 0.9)',
  textShadowOffset: {width: 0, height: 0},
  textShadowRadius: 4,
});

// 1장 상태: 계단/경사로 3D 안내.
// Figma(174:7088/7089, 프리뷰 390 기준): 캡션 y=188(48.2%), SVG y=238~348.
export const StairsOverlay = styled.View({
  position: 'absolute',
  top: '48.2%',
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
  // Figma(174:7088): DROP_SHADOW radius 4 / #000000 0.9 / offset(0,0) 3겹.
  // RN Text 는 textShadow 를 1겹만 지원하므로 동일 파라미터로 근사한다.
  textShadowColor: 'rgba(0, 0, 0, 0.9)',
  textShadowOffset: {width: 0, height: 0},
  textShadowRadius: 4,
});

// Figma(174:6988 Frame 508): 99x32, radius 30, #000000 40%, gap 2, padding L6/R8.
export const Tips = styled(SccPressable)({
  flexDirection: 'row',
  alignItems: 'center',
  height: 32,
  gap: 2,
  paddingLeft: 6,
  paddingRight: 8,
  backgroundColor: color.blacka40,
  borderRadius: 30,
});

export const Tip = styled.Text({
  color: 'white',
  fontFamily: font.pretendardRegular,
  fontSize: 14,
  lineHeight: 20,
});

// Figma(174:6949 Frame 1261160153): 프리뷰 → 썸네일 20 → 버튼행 20.
export const TakenPhotosSection = styled.View({
  marginTop: SECTION_GAP - PHOTO_ROW_OVERHANG,
});

export const TakenPhotos = styled.View({
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  // 56(슬롯) + 6*2(FlatList contentContainer paddingVertical). 압축되면 잘리므로 고정한다.
  height: 56 + PHOTO_ROW_OVERHANG * 2,
  flexShrink: 0,
});

// 입구 촬영에는 3칸 플레이스홀더가 장수를 알려주므로 Figma 에서 이 문구가 빠졌다.
// 리뷰/화장실/엘리베이터는 플레이스홀더가 없어 0장이면 빈 줄만 남으므로 문구를 유지한다.
export const PhotoCaption = styled.Text({
  marginTop: 8,
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
  // Figma(174:6954 selector): cornerRadius 8, fill #FFFFFF + 노드 opacity 0.2.
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

// Figma(174:6955 Frame 1261160152): 350x78. 촬영 버튼(78)이 행 높이를 결정하고
// 기능 버튼 스택(69)은 9px 아래에서 시작한다.
export const ActionsWrapper = styled.View({
  // paddingHorizontal 을 두면 absolute 자식(SideButton)의 left/right 기준이 padding
  // edge 로 밀려 Figma 좌표와 어긋난다. 촬영 버튼만 flow 에 있으므로 padding 불필요.
  justifyContent: 'center',
  alignItems: 'flex-start',
  flexDirection: 'row',
  marginTop: SECTION_GAP - PHOTO_ROW_OVERHANG,
  height: 78,
  position: 'relative',
});

// Figma(174:6966/6967): 바깥 원 78 + stroke 4(INSIDE), 안쪽 원 66 흰색.
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
  width: 66,
  height: 66,
  borderRadius: 33,
  backgroundColor: 'white',
});

// 하단 기능 버튼(앨범/가이드/플래시/타이머). Figma(174:6957 Frame 1261159834):
// 원 45x45(#000000 0.4) + gap 6 + 라벨 13/lh18 = 스택 45x69.
// 촬영 버튼(Group 501, 78x78 @y=655)보다 스택(y=664)이 9px 아래에서 시작한다.
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
  top: 9,
  left,
  right,
  width: SIDE_BUTTON_SIZE,
  alignItems: 'center',
  gap: 6,
  // Figma(174:6957): 비활성 앨범은 스택 전체 opacity 0.3.
  opacity: isDimmed ? 0.3 : 1,
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
  color: isOn ? color.yellow30 : 'white',
  fontFamily: font.pretendardRegular,
  fontSize: 13,
  lineHeight: 18,
  textAlign: 'center',
}));

// Figma(174:7786): 툴팁(말풍선 44 + 꼬리 6)이 y=611..661, 촬영 버튼 top 은 y=655.
// ActionsWrapper top = 촬영 버튼 top 이므로 툴팁 top = -44.
export const TooltipAnchor = styled(Animated.View)({
  position: 'absolute',
  left: 0,
  right: 0,
  top: -44,
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
