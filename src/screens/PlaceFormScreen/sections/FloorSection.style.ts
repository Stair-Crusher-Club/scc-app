import styled from 'styled-components/native';

import {font} from '@/constant/font';

export const FloorSection = styled.View({
  backgroundColor: 'white',
  paddingVertical: 40,
  paddingHorizontal: 30,
});
export const Header = styled.View({
  marginBottom: 30,
});
export const SectionTitle = styled.Text({
  fontSize: 24,
  fontFamily: font.pretendardBold,
  color: 'black',
});
export const Label = styled.Text({
  fontSize: 16,
  fontFamily: font.pretendardRegular,
  color: 'black',
  marginBottom: 20,
});

export const FloorUnit = styled.Text({
  fontSize: 16,
  fontFamily: font.pretendardRegular,
});
