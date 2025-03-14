import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const PlaceDetailInfoItem = styled.View({
  flexDirection: 'row',
  alignItems: 'flex-start',
});
export const TextContainer = styled.View({
  flex: 1,
  marginHorizontal: 15,
});
export const Title = styled.Text({
  color: color.black,
  fontSize: 18,
  fontFamily: font.pretendardBold,
});
export const Description = styled.Text({
  color: color.gray90,
  fontSize: 16,
  fontFamily: font.pretendardRegular,
  marginTop: 4,
});
