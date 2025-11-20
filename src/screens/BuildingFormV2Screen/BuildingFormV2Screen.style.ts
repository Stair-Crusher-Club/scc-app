import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const SectionSeparator = styled.View({
  backgroundColor: color.gray10,
  height: 6,
});

export const FormContainer = styled.View({
  backgroundColor: 'white',
  paddingVertical: 40,
  paddingHorizontal: 20,
  gap: 20,
});

export const SubSection = styled.View({
  gap: 20,
});

export const SectionLabel = styled.Text({
  fontSize: 14,
  lineHeight: 20,
  fontFamily: font.pretendardBold,
  color: color.brand50,
});

export const QuestionSection = styled.View({
  gap: 8,
});

export const QuestionText = styled.Text({
  fontSize: 22,
  lineHeight: 30,
  fontFamily: font.pretendardSemibold,
  color: color.gray80,
});

export const Label = styled.Text({
  fontSize: 22,
  lineHeight: 30,
  fontFamily: font.pretendardSemibold,
  color: color.gray80,
});

export const MeasureGuide = styled.View({
  aspectRatio: '315/152',
  borderRadius: 8,
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: color.gray20,
});

export const SubmitButtonWrapper = styled.View({
  backgroundColor: color.white,
  paddingVertical: 12,
  paddingHorizontal: 20,
  borderTopWidth: 1,
  borderTopColor: color.gray15,
});

export const TabBarWrapper = styled.View({
  backgroundColor: color.white,
});
