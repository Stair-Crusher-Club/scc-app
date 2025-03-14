import React from 'react';
import {TextInputProps} from 'react-native';

import {color} from '@/constant/color';

import * as S from './TextInput.style';

interface Props extends TextInputProps {
  value: string;
  label: string;
  placeholder: string;
  errorMessage?: string;
  optional?: 'optional' | 'required';
}

export default function TextInput(props: Props) {
  const [isFocused, setIsFocused] = React.useState(false);
  return (
    <S.InputWithLabelContainer>
      <S.LabelWrapper>
        {props.optional === 'required' && <S.LabelPoint>*</S.LabelPoint>}
        <S.Label>{props.label}</S.Label>
        {props.optional === 'optional' && <S.Optional>(선택)</S.Optional>}
        {props.optional === 'required' && <S.Optional>(필수)</S.Optional>}
      </S.LabelWrapper>
      <S.TextInputContainer focused={isFocused} hasError={!!props.errorMessage}>
        <S.Input
          value={props.value}
          onChangeText={props.onChangeText}
          placeholderTextColor={color.gray50}
          onFocus={() => setIsFocused(true)}
          onBlur={e => {
            props.onBlur?.(e);
            setIsFocused(false);
          }}
          placeholder={props.placeholder}
        />
      </S.TextInputContainer>
      {props.errorMessage && (
        <S.ErrorWrapper>
          <S.ErrorMessage>{props.errorMessage}</S.ErrorMessage>
        </S.ErrorWrapper>
      )}
    </S.InputWithLabelContainer>
  );
}
