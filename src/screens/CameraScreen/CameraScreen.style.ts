import styled from 'styled-components/native';

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
  aspectRatio: '1 / 1',
});

export const TipsWrapper = styled.View({
  marginVertical: 20,
  marginHorizontal: 20,
  alignItems: 'flex-start',
});

export const Tips = styled.Pressable({
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

export const TakenPhotos = styled.View({
  flex: 1,
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 16,
});

export const NoPhotosTaken = styled.Text({
  color: 'white',
  fontFamily: font.pretendardRegular,
  fontSize: 16,
  textAlign: 'center',
});

export const TakenPhotoItem = styled.Pressable({});

export const Thumbnail = styled.Image({
  backgroundColor: color.gray20,
  borderRadius: 12,
  width: 56,
  height: 56,
  overflow: 'hidden',
});
export const CloseButton = styled.Pressable({
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
});

export const CaptureButton = styled.Pressable(props => ({
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

export const FlashButton = styled.Pressable({
  position: 'absolute',
  bottom: 12,
  right: 32,
  width: 56,
  height: 56,
  backgroundColor: color.blacka40,
  borderRadius: 28,
  justifyContent: 'center',
  alignItems: 'center',
});
