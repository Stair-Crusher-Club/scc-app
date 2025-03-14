import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const GuideItem = styled.View({
  flexDirection: 'row',
  paddingVertical: 10,
});
export const ContentsContainer = styled.View({
  flex: 1,
  flexDirection: 'column',
  flexGrow: 1,
  marginLeft: 10,
});
export const Title = styled.Text({
  color: color.black,
  fontSize: 16,
  fontFamily: font.pretendardBold,
});
export const Description = styled.Text({
  color: color.gray90,
  fontSize: 14,
  fontFamily: font.pretendardRegular,
  marginTop: 10,
});
