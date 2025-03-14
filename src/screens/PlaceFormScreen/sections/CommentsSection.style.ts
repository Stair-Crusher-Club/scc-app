import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const CommentsSection = styled.View({
  backgroundColor: 'white',
  paddingVertical: 40,
  paddingHorizontal: 30,
  gap: 30,
});
export const Header = styled.View({});
export const SectionTitle = styled.Text({
  fontSize: 24,
  fontFamily: font.pretendardBold,
  color: 'black',
});
export const Description = styled.Text({
  fontSize: 16,
  fontFamily: font.pretendardRegular,
  color: 'black',
  letterSpacing: -0.5,
});
export const Optional = styled(Description)({
  color: color.gray70,
});
