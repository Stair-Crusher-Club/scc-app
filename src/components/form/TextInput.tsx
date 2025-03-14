import React from 'react';
import {TextInputProps} from 'react-native';

import {color} from '@/constant/color';

import * as S from './TextInput.style';

interface Props extends TextInputProps {}

export default function TextInput(props: Props) {
  return (
    <S.TextInputContainer>
      <S.Input placeholderTextColor={color.gray50} {...props} />
    </S.TextInputContainer>
  );
}
