import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const Container = styled.View({
  flex: 1,
  backgroundColor: color.white,
});

export const Header = styled.View({
  height: 48,
  alignItems: 'center',
  justifyContent: 'center',
});

export const ContentsContainer = styled.View({
  flex: 1,
});

export const MainImage = styled.Image({
  width: '100%',
  height: 142,
});

export const TitleContainer = styled.View(() => ({
  paddingTop: 32,
  paddingBottom: 16,
  paddingLeft: 20,
  paddingRight: 20,
  backgroundColor: color.brand,
}));

export const Title = styled.Text({
  color: color.white,
  fontSize: 24,
  fontFamily: font.pretendardBold,
});

export const Description = styled.Text({
  marginTop: 14,
  marginLeft: 2,
  color: color.white,
  fontFamily: font.pretendardSemibold,
  fontSize: 13,
  textDecorationLine: 'underline',
});
