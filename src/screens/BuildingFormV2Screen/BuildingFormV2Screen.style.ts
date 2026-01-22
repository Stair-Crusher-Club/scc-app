import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

// Re-export common styled components from PlaceFormV2Screen
export {
  GuideButton,
  GuideText,
  HeaderBorder,
  Label,
  MeasureGuide,
  OptionsGroup,
  QuestionSection,
  QuestionText,
  RequiredMark,
  SectionLabel,
  SectionSeparator,
  SubSection,
} from '@/screens/PlaceFormV2Screen/PlaceFormV2Screen';

// BuildingFormV2Screen-specific styled components
export const FormContainer = styled.View({
  backgroundColor: 'white',
  paddingVertical: 40,
  paddingHorizontal: 20,
  gap: 20,
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

export const HeaderBackText = styled.Text`
  font-size: 24px;
  color: ${color.gray80};
  font-family: ${font.pretendardMedium};
`;
