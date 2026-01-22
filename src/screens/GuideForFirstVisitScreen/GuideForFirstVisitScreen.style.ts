import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {Platform} from 'react-native';

export const Container = styled.View({
  flex: 1,
  paddingHorizontal: 24,
  paddingBottom: Platform.OS === 'android' ? 20 : 0,
});

export const Header = styled.View({
  height: 50,
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'center',
});

export const CoverImage = styled.Image({
  width: 200,
  height: 221,
  alignSelf: 'center',
});

export const Title = styled.Text({
  color: color.black,
  fontSize: 22,
  fontFamily: font.pretendardSemibold,
  lineHeight: 30,
  marginTop: 36,
  textAlign: 'center',
});

export const GuideItems = styled.View({
  marginTop: 20,
  backgroundColor: color.gray10,
  padding: '16px 20px',
  borderRadius: 12,
  gap: 16,
});
