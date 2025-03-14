import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const Container = styled.ScrollView({
  background: color.white,
});

export const Contents = styled.View({
  paddingTop: 30,
});

export const Title = styled.Text({
  color: color.black,
  fontSize: 24,
  fontFamily: font.pretendardBold,
  paddingHorizontal: 25,
});

export const GuideText = styled.Text({
  color: color.black,
  fontSize: 16,
  fontFamily: font.pretendardRegular,
  marginTop: 25,
  paddingHorizontal: 25,
  marginBottom: 60,
});

export const ChallengeRankContainer = styled.View({
  paddingTop: 33,
  backgroundColor: color.white,
});

export const ButtonContainer = styled.View({
  height: 96,
  padding: 20,
  background: color.white,
});
