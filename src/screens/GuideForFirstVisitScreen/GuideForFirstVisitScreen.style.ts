import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {Platform} from 'react-native';

export const Container = styled.View({
  flex: 1,
  paddingHorizontal: 20,
  paddingBottom: 20,
  backgroundColor: color.white,
});

export const ContentArea = styled.View({
  flex: 1,
  alignItems: 'center',
  justifyContent: 'flex-start',
  paddingTop: 120,
});

export const CoverImage = styled.Image({
  width: 200,
  height: 223,
  alignSelf: 'center',
});

export const TextContainer = styled.View({
  marginTop: 32,
  alignItems: 'center',
  gap: 4,
});

export const TitleLine = styled.Text({
  color: color.gray90v2,
  fontSize: 22,
  fontFamily: font.pretendardSemibold,
  lineHeight: 30,
  letterSpacing: -0.44,
  textAlign: 'center',
});

export const NicknameText = styled.Text({
  color: color.brand50,
});
