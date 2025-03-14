import {TextInput} from 'react-native';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

export const TextAreaContainer = styled.View<{
  focused?: boolean;
  hasError?: boolean;
}>(props => ({
  borderColor: props.hasError
    ? color.red
    : props.focused
    ? color.brandColor
    : color.gray30,
  borderWidth: 1,
  borderRadius: 20,
  paddingHorizontal: 25,
  paddingVertical: 20,
}));
export const Input = styled(TextInput)({
  color: 'black',
  fontSize: 16,
  fontFamily: font.pretendardRegular,
  paddingVertical: 0,
  textAlignVertical: 'top',
});

export const InputWithLabelContainer = styled.View({
  gap: 10,
});

export const LabelWrapper = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 2,
});
export const Label = styled.Text({
  fontSize: 16,
  lineHeight: '24px',
  fontFamily: font.pretendardBold,
});
export const Optional = styled.Text({
  fontSize: 16,
  lineHeight: '24px',
  fontFamily: font.pretendardRegular,
  color: color.gray70,
});

export const ErrorWrapper = styled.View({});
export const ErrorMessage = styled.Text({
  fontSize: 14,
  lineHeight: '21px',
  fontFamily: font.pretendardRegular,
  color: color.red,
});
