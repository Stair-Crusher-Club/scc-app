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

export const DoorFrameGroundLineLeft = styled.View({
  position: 'absolute',
  left: 0,
  right: '50%',
  marginRight: DOOR_FRAME_WIDTH / 2,
  bottom: 0,
  borderTopWidth: 2,
  borderStyle: 'dashed',
  borderColor: 'white',
});

export const DoorFrameGroundLineRight = styled.View({
  position: 'absolute',
  right: 0,
  left: '50%',
  marginLeft: DOOR_FRAME_WIDTH / 2,
  bottom: 0,
  borderTopWidth: 2,
  borderStyle: 'dashed',
  borderColor: 'white',
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

export const TakenPhotosSection = styled.View({
  flex: 1,
  justifyContent: 'center',
  gap: 8,
  paddingVertical: 8,
});

export const TakenPhotos = styled.View({
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
});

// 캡션(2줄 × lineHeight 20)이 사라져도 썸네일 행이 움직이지 않도록 높이를 고정한다.
export const PhotoCaptionSlot = styled.View({
  height: 40,
});

export const PhotoCaption = styled.Text({
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
  disabled?: boolean;
}>(({left, right, disabled}) => ({
  position: 'absolute',
  top: 11,
  left,
  right,
  width: SIDE_BUTTON_SIZE,
  alignItems: 'center',
  gap: 6,
  opacity: disabled ? 0.4 : 1,
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
