import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const CoverImageContainer = styled.View({
  width: '100%',
  backgroundColor: color.gray50,
  aspectRatio: '375 / 300',
});
export const CoverImage = styled.Image({
  width: '100%',
  aspectRatio: '375 / 300',
});

export const ImageType = styled.View({
  position: 'absolute',
  bottom: 20,
  left: 20,
  paddingHorizontal: 10,
  paddingVertical: 4,
  backgroundColor: color.blacka70,
  borderRadius: 4,
});

export const SlideText = styled.Text({
  fontFamily: font.pretendardRegular,
  fontSize: 14,
  lineHeight: '22px',
  color: color.white,
});

export const SlideIndex = styled.View({
  position: 'absolute',
  bottom: 20,
  right: 20,
  paddingHorizontal: 10,
  paddingVertical: 4,
  backgroundColor: color.blacka70,
  borderRadius: 50,
});
