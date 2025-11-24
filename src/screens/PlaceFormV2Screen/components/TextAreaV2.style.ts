import {TextInput} from 'react-native';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const TextAreaContainer = styled.View<{
  focused?: boolean;
  hasError?: boolean;
}>`
  border-color: ${(props: {focused?: boolean; hasError?: boolean}) =>
    props.hasError
      ? color.red
      : props.focused
        ? color.brandColor
        : color.gray20};
  border-width: 1px;
  border-radius: 12px;
  padding-horizontal: 12px;
  padding-vertical: 12px;
  min-height: 160px;
`;

export const Input = styled(TextInput)`
  color: black;
  font-size: 16px;
  font-family: ${font.pretendardRegular};
  padding-vertical: 0;
  text-align-vertical: top;
`;

export const InputWithLabelContainer = styled.View`
  gap: 10px;
`;

export const LabelWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 2px;
`;

export const Label = styled.Text`
  font-size: 16px;
  line-height: 24px;
  font-family: ${font.pretendardBold};
`;

export const Optional = styled.Text`
  font-size: 16px;
  line-height: 24px;
  font-family: ${font.pretendardRegular};
  color: ${color.gray70};
`;

export const ErrorWrapper = styled.View``;

export const ErrorMessage = styled.Text`
  font-size: 14px;
  line-height: 21px;
  font-family: ${font.pretendardRegular};
  color: ${color.red};
`;
