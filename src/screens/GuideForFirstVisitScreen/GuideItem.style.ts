import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const GuideItem = styled.View({
  gap: 4,
});

export const Title = styled.Text({
  color: color.black,
  fontSize: 18,
  lineHeight: 26,
  fontFamily: font.pretendardSemibold,
});
export const Description = styled.Text({
  color: color.gray90,
  fontSize: 15,
  lineHeight: 24,
  fontFamily: font.pretendardRegular,
});
