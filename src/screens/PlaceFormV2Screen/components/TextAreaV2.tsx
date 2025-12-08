import React, {useState} from 'react';
import {TextInput, TextInputProps, View} from 'react-native';

import {tailwindColor} from '@/constant/tailwindColor';
import {cn} from '@/utils/cn';

interface Props extends TextInputProps {}

export default function TextAreaV2(props: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View
      className={cn(
        'rounded-[12px] px-[12px] py-[12px] min-h-[160px] border',
        focused ? 'border-brand-50' : 'border-gray-20',
      )}>
      <TextInput
        className="font-pretendard-regular text-black text-[16px]"
        style={{textAlignVertical: 'top'}}
        placeholderTextColor={tailwindColor.gray[50]}
        multiline
        {...props}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
}
