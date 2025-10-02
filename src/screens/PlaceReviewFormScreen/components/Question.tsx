import React, {PropsWithChildren} from 'react';
import {Text} from 'react-native';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

interface QuestionProps extends PropsWithChildren {
  required?: boolean;
  multiple?: boolean;
}

export default function Question({
  children,
  required = false,
  multiple = false,
}: QuestionProps) {
  return (
    <QuestionText>
      {required && <Text style={{color: color.red}}>* </Text>}
      {children}
      {multiple && <Text style={{color: color.gray40}}> (중복선택)</Text>}
    </QuestionText>
  );
}

export const QuestionText = styled.Text({
  fontSize: 16,
  lineHeight: '28px',
  fontFamily: font.pretendardMedium,
});
