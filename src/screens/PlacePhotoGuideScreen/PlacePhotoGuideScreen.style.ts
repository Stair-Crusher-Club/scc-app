import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const Header = styled.View({
  flexFlow: 'row',
  justifyContent: 'flex-end',
  paddingVertical: 5,
  backgroundColor: '#262629',
});

export const CloseButton = styled.Pressable({
  padding: 16,
  color: 'white',
});

export const SampleImage = styled.View({
  width: '100%',
  aspectRatio: '1/1',
});

export const GuideMessage = styled.View({
  gap: 8,
  marginVertical: 20,
  marginHorizontal: 30,
  padding: 20,
  backgroundColor: color.blacka40,
  borderRadius: 8,
});

export const GuideMessageTitle = styled.Text({
  fontFamily: font.pretendardBold,
  color: color.white,
  fontSize: 16,
  lineHeight: '24px',
});

export const GuideMessageContent = styled.Text({
  fontFamily: font.pretendardRegular,
  color: color.white,
  fontSize: 14,
  lineHeight: '22px',
  textIndent: '-20px',
});

export const More = styled.Text({
  color: color.brandColor,
  fontSize: 14,
  fontFamily: font.pretendardMedium,
  textAlign: 'right',
});
