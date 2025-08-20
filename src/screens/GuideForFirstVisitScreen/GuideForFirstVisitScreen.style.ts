import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {Platform} from 'react-native';

export const Container = styled.View({
  flex: 1,
  marginTop: 50,
  marginHorizontal: 25,
  paddingBottom: Platform.OS === 'android' ? 20 : 0,
});

export const CoverImage = styled.Image({
  width: 180,
  height: 140,
  marginTop: 30,
  alignSelf: 'center',
});

export const Title = styled.Text({
  color: color.black,
  fontSize: 24,
  fontFamily: font.pretendardBold,
  lineHeight: '36px',
  marginTop: 40,
});

export const GuideItems = styled.View({
  marginTop: 40,
});
