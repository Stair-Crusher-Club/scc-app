import styled from 'styled-components/native';

import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const Photos = styled.View({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: 10,
});

export const TakePhoto = styled.View({
  flex: 1,
  backgroundColor: color.blue30a15,
  borderRadius: 20,
});

export const TakePhotoButton = styled(SccPressable)({
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  height: 64,
});

export const TakePhotoText = styled.Text({
  color: color.brandColor,
  fontSize: 16,
  fontFamily: font.pretendardMedium,
  marginLeft: 8,
});

export const Photo = styled.View({
  flex: 1,
  aspectRatio: '1 / 1',
});

export const SmallCameraButton = styled(SccPressable)({
  flex: 1,
  borderColor: color.gray30,
  borderWidth: 1,
  borderRadius: 20,
  justifyContent: 'center',
  alignItems: 'center',
});

export const Thumbnail = styled.View({
  flex: 1,
  overflow: 'hidden',
  borderRadius: 20,
});

export const ThumbnailImage = styled.Image({
  backgroundColor: color.gray20,
  flex: 1,
});

export const DeleteButton = styled(SccPressable)({
  position: 'absolute',
  top: -4,
  right: -4,
});
