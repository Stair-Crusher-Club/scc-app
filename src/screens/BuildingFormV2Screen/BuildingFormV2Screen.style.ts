import {TextInput} from 'react-native';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

// Re-export common styled components from PlaceFormV2Screen
export {
  DoorDirectionContainer as EntranceDirectionContainer,
  DoorDirectionImageContainer as EntranceDirectionImageContainer,
  DoorDirectionOption as EntranceDirectionOption,
  GuideButton,
  GuideText,
  HeaderBorder,
  Hint,
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
  letter-spacing: -0.48px;
`;

export const SubQuestion = styled.View`
  margin-top: 16px;
  gap: 8px;
`;

export const TextInputContainer = styled.View`
  border-width: 1px;
  border-color: ${color.gray20};
  border-radius: 12px;
  padding-horizontal: 16px;
  padding-vertical: 12px;
`;

export const StyledTextInput = styled(TextInput)`
  font-size: 16px;
  font-family: ${font.pretendardRegular};
  color: ${color.gray100};
  padding: 0;
`;
