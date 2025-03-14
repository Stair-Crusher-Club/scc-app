import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const Cover = styled.View({
  backgroundColor: color.brandColor,
  alignItems: 'center',
  paddingTop: 20,
});
export const Title = styled.Text({
  color: color.white,
  fontSize: 28,
  fontFamily: font.pretendardBold,
  marginTop: 20,
  marginBottom: 10,
  textAlign: 'center',
});

export const CoverImage = styled.Image({
  width: '100%',
  height: 'auto',
  aspectRatio: '375/265',
  marginTop: 40,
});

export const MessageContainer = styled.View({
  padding: 20,
  backgroundColor: 'white',
});
export const ButtonContainer = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
  height: 96,
  paddingHorizontal: 20,
});
