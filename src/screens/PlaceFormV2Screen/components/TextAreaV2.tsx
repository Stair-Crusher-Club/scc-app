import React, {useState} from 'react';
import {TextInputProps} from 'react-native';

import {color} from '@/constant/color';

import * as S from './TextAreaV2.style';

interface Props extends TextInputProps {}

export default function TextAreaV2(props: Props) {
  const [focused, setFocused] = useState(false);

  const handleFocus = (e: any) => {
    setFocused(true);
    props.onFocus?.(e);
  };

  return (
    <S.TextAreaContainer focused={focused}>
      <S.Input
        placeholderTextColor={color.gray50}
        multiline
        {...props}
        onFocus={handleFocus}
        onBlur={() => setFocused(false)}
      />
    </S.TextAreaContainer>
  );
}
