import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const ElevatorSection = styled.View({
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
export const SubSection = styled.View({
  gap: 20,
});
export const Label = styled.Text({
  fontSize: 16,
  fontFamily: font.pretendardRegular,
  color: 'black',
});
export const LabelExtra = styled(Label)({
  color: color.gray70,
});
export const MeasureGuide = styled.View({
  aspectRatio: '315/152',
  borderRadius: 20,
  overflow: 'hidden',
});
