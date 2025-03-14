import React from 'react';
import {TextInputProps} from 'react-native';

import {color} from '@/constant/color';

import * as S from './TextArea.style';

interface Props extends TextInputProps {}

export default function TextInput(props: Props) {
  return (
    <S.TextAreaContainer>
      <S.Input placeholderTextColor={color.gray50} multiline {...props} />
    </S.TextAreaContainer>
  );
}
