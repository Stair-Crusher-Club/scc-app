import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const AchievementsSection = styled.View({
  width: '100%',
  paddingBottom: 14,
});

export const Image = styled.Image({
  width: '100%',
  height: 'auto',
  aspectRatio: '375 / 108',
});

export const TextWrapper = styled.View({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  marginLeft: 20,
});

export const Text = styled.Text({
  fontSize: 16,
  lineHeight: 26,
  fontFamily: font.pretendardRegular,
  color: color.gray90,
});

export const Total = styled.Text({
  fontSize: 28,
  lineHeight: '42px',
  fontFamily: font.pretendardBold,
  color: color.black,
  verticalAlign: 'middle',
});
