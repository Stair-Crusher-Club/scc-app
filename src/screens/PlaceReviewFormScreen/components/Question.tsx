import React, {PropsWithChildren} from 'react';
import {Text} from 'react-native';

import {color} from '@/constant/color';

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
    <Text className="font-pretendard-medium text-[16px] leading-[28px]">
      {required && <Text style={{color: color.red}}>* </Text>}
      {children}
      {multiple && <Text className="text-gray-40"> (중복선택)</Text>}
    </Text>
  );
}
