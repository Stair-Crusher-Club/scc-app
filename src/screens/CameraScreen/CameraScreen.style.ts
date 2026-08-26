import {StyleSheet} from 'react-native';
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

// 0장 상태: 문 프레임 안내(세로 점선 사각형 + 좌우 지면 점선). 에셋 없이 dashed View로 구현.
export const DoorFrameOverlay = styled.View({
  ...StyleSheet.absoluteFillObject,
  justifyContent: 'center',
  alignItems: 'center',
});

export const DoorFrameRect = styled.View({
  width: DOOR_FRAME_WIDTH,
  height: '100%',
  borderWidth: 2,
  borderStyle: 'dashed',
  borderColor: 'white',
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
  top: '42%',
  left: 24,
  right: 24,
  color: 'white',
  fontFamily: font.pretendardMedium,
  fontSize: 15,
  lineHeight: 21,
  textAlign: 'center',
});

// 1장 상태: 계단/경사로 3D 안내
export const StairsOverlay = styled.View({
  ...StyleSheet.absoluteFillObject,
  justifyContent: 'flex-end',
  alignItems: 'center',
  paddingBottom: 32,
});

export const StairsOverlayCaption = styled.Text({
  color: 'white',
  fontFamily: font.pretendardMedium,
  fontSize: 15,
  lineHeight: 21,
  textAlign: 'center',
  paddingHorizontal: 24,
  marginBottom: 24,
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
  gap: 16,
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
  gap: 16,
  paddingHorizontal: 10,
});

export const PlaceholderSlot = styled.View({
  width: 56,
  height: 56,
  borderRadius: 12,
  backgroundColor: color.gray80,
  justifyContent: 'center',
  alignItems: 'center',
});

export const PlaceholderImage = styled.Image({
  width: 28,
  height: 28,
});

export const TakenPhotoItem = styled(SccPressable)({});

export const Thumbnail = styled.Image({
  backgroundColor: color.gray20,
  borderRadius: 12,
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
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'row',
  marginVertical: 24,
  paddingHorizontal: 30,
  position: 'relative',
});

export const CaptureButton = styled(SccPressable)(props => ({
  width: 72,
  height: 72,
  backgroundColor: 'transparent',
  borderRadius: 36,
  borderColor: 'white',
  borderStyle: 'solid',
  borderWidth: 4,
  justifyContent: 'center',
  alignItems: 'center',
  opacity: props.disabled ? 0.3 : 1,
}));

export const CaptureInnerDeco = styled.View({
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: 'white',
});

export const FlashButton = styled(SccPressable)({
  position: 'absolute',
  bottom: 12,
  right: 80,
  width: 48,
  height: 48,
  backgroundColor: color.blacka40,
  borderRadius: 24,
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
});

export const FlashButtonText = styled.Text({
  color: 'white',
  fontFamily: font.pretendardRegular,
  fontSize: 13,
  textAlign: 'center',
  position: 'absolute',
  bottom: -19, // 6px margin + fontSize 100%
});

export const TimerButton = styled(SccPressable)({
  position: 'absolute',
  bottom: 12,
  right: 24,
  width: 48,
  height: 48,
  backgroundColor: color.blacka40,
  borderRadius: 24,
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
});

export const TimerButtonText = styled.Text<{isOn?: boolean}>(({isOn}) => ({
  color: isOn ? color.yellow : 'white',
  fontFamily: font.pretendardRegular,
  fontSize: 13,
  textAlign: 'center',
  position: 'absolute',
  bottom: -19, // 6px margin + fontSize 100%
}));

export const AlbumButton = styled(SccPressable)<{disabled?: boolean}>(
  ({disabled}) => ({
    position: 'absolute',
    bottom: 12,
    left: 24,
    width: 48,
    height: 48,
    backgroundColor: color.blacka40,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    opacity: disabled ? 0.4 : 1,
  }),
);

export const AlbumButtonText = styled.Text({
  color: 'white',
  fontFamily: font.pretendardRegular,
  fontSize: 13,
  textAlign: 'center',
  position: 'absolute',
  bottom: -19, // 6px margin + fontSize 100%
});

export const GuideButton = styled(SccPressable)({
  position: 'absolute',
  bottom: 12,
  left: 80, // 앨범 버튼(left:24, width:48) 오른쪽에 8px 간격
  width: 48,
  height: 48,
  backgroundColor: color.blacka40,
  borderRadius: 24,
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
});

export const GuideButtonText = styled.Text<{isOn?: boolean}>(({isOn}) => ({
  color: isOn ? color.yellow : 'white',
  fontFamily: font.pretendardRegular,
  fontSize: 13,
  textAlign: 'center',
  position: 'absolute',
  bottom: -19, // 6px margin + fontSize 100%
}));

export const TooltipAnchor = styled.View({
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: '100%',
  marginBottom: 8,
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
