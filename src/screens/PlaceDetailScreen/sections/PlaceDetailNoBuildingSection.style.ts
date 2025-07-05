import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const PlaceDetailNoBuildingSection = styled.View({
  backgroundColor: color.white,
  paddingHorizontal: 30,
  paddingVertical: 32,
});

export const Title = styled.Text({
  fontSize: 24,
  fontFamily: font.pretendardBold,
});
export const Description = styled.Text({
  fontSize: 18,
  fontFamily: font.pretendardRegular,
  marginTop: 4,
});

export const NoBuildingCard = styled.View({
  gap: 15,
  marginTop: 20,
  padding: 20,
  borderRadius: 20,
  backgroundColor: color.gray10,
});
export const CardHeader = styled.View({
  alignItems: 'center',
  padding: 5,
  gap: 10,
});
export const CardTitle = styled.Text({
  fontSize: 18,
  letterSpacing: -0.5,
  fontFamily: font.pretendardMedium,
  textAlign: 'center',
});
