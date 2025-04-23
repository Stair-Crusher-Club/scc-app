import React, {useState} from 'react';
import {TextInputProps} from 'react-native';

import {color} from '@/constant/color';

import * as S from './TextArea.style';

interface Props extends TextInputProps {}

export default function TextInput(props: Props) {
  const [focused, setFocused] = useState(false);
  return (
    <S.TextAreaContainer focused={focused}>
      <S.Input
        placeholderTextColor={color.gray50}
        multiline
        {...props}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </S.TextAreaContainer>
  );
}
