import React from 'react';
import {Text, View} from 'react-native';

import {SccPressable} from '@/components/SccPressable';
import {cn} from '@/utils/cn';

interface Option {
  label: string;
  value: any;
}

interface OptionsChipProps {
  values: any[];
  options: Option[];
  onSelect: (values: any[]) => void;
}

export default function OptionsChip({
  values,
  options,
  onSelect,
}: OptionsChipProps) {
  function handleSelect(value: any) {
    if (values?.includes(value)) {
      onSelect(values.filter(v => v !== value));
    } else {
      if (!values) {
        onSelect([value]);
      } else {
        onSelect([...values, value]);
      }
    }
  }

  return (
    <View className="flex-row flex-wrap items-start gap-[12px]">
      {options.map((option, idx) => {
        const selected = values?.includes(option.value);
        return (
          <SccPressable
            key={option.label + idx}
            elementName="option_chip"
            disableLogging
            className={cn(
              'rounded-[14px] border-[1.2px] flex flex-row gap-[5px]',
              'justify-center items-center px-[16px] py-[8px]',
              selected
                ? 'border-blue-40 bg-brand-5'
                : 'border-gray-20 bg-white',
            )}
            onPress={() => handleSelect(option.value)}>
            <Text
              className={cn(
                'text-center text-[16px] leading-[24px] font-pretendard-medium',
                selected ? 'text-brand-50' : 'text-gray-80',
              )}>
              {option.label}
            </Text>
          </SccPressable>
        );
      })}
    </View>
  );
}
