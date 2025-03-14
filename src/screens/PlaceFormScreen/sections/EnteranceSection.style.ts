import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const EnteranceSection = styled.View({
  backgroundColor: 'white',
  paddingVertical: 40,
  paddingHorizontal: 30,
  gap: 30,
});

export const Header = styled.View({});
export const CautionCard = styled.View({
  backgroundColor: color.gray10,
  borderRadius: 8,
  padding: 20,
  paddingBottom: 16,
});

export const CautionTitle = styled.Text({
  fontSize: 14,
  fontFamily: font.pretendardBold,
  color: color.gray90,
  marginBottom: 8,
});
export const CautionMessage = styled.Text({
  fontSize: 14,
  fontFamily: font.pretendardRegular,
  color: color.gray90,
  lineHeight: '22px',
});

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

export const Guide = styled.View({});

export const GuideText = styled.Text({
  color: color.brandColor,
  fontSize: 14,
  fontFamily: font.pretendardMedium,
  textAlign: 'right',
});
