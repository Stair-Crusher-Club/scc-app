import React from 'react';
import {Text, View} from 'react-native';
import {SvgProps} from 'react-native-svg';

import {SccPressable} from '@/components/SccPressable';
import {cn} from '@/utils/cn';

interface Option {
  label: string;
  icon?: React.ComponentType<SvgProps & {pointColor?: string}>;
  disabled?: boolean;
  value: any;
}
interface Props {
  value: any;
  options: Option[];
  columns?: 1 | 2 | 3; // 한줄, 두줄, 세줄로 나열하기
  onSelect: (value: any) => void;
}
export default function OptionsV2({
  options,
  value,
  columns = 2,
  onSelect,
}: Props) {
  const getWidth = () => {
    if (columns === 1) return '100%';
    if (columns === 3) return '30%';
    return '40%';
  };

  return (
    <View className="flex-row flex-wrap justify-between gap-y-[16px] gap-x-[12px]">
      {options.map((option, i) => {
        const selected = option.value === value;
        const disabled = option.disabled ?? false;

        return (
          <SccPressable
            key={i}
            elementName="option_single_select"
            disableLogging
            className={cn(
              'rounded-[14px] flex-row justify-center items-center flex-grow px-[14px] py-[12px] gap-[5px]',
              'border-[1.2px]',
              selected
                ? 'border-blue-50 bg-brand-5'
                : 'border-gray-20 bg-white',
              disabled && 'opacity-30',
            )}
            style={{
              width: getWidth(),
            }}
            onPress={() => onSelect(option.value)}>
            <Text
              className={cn(
                'flex-1 text-center font-pretendard-medium text-[16px] leading-[24px]',
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

interface MultipleProps {
  values: any[];
  options: Option[];
  columns?: 1 | 2 | 3; // 한줄, 두줄, 세줄로 나열하기
  onSelect: (values: any[]) => void;
}
OptionsV2.Multiple = function MultipleOptions({
  options,
  values,
  columns = 2,
  onSelect,
}: MultipleProps) {
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

  const getWidth = () => {
    if (columns === 1) return '100%';
    if (columns === 3) return '30%';
    return '40%';
  };

  return (
    <View className="flex-row flex-wrap justify-between gap-y-[16px] gap-x-[12px]">
      {options.map((option, i) => {
        const selected = values?.includes(option.value);
        const disabled = option.disabled ?? false;

        return (
          <SccPressable
            key={i}
            elementName="option_multi_select"
            disableLogging
            className={cn(
              'rounded-[14px] flex-row justify-center items-center flex-grow px-[14px] py-[12px] gap-[5px]',
              'border-[1.2px]',
              selected
                ? 'border-blue-40 bg-brand-5'
                : 'border-gray-20 bg-white',
              disabled && 'opacity-30',
            )}
            style={{
              width: getWidth(),
            }}
            onPress={() => handleSelect(option.value)}>
            <Text
              className={cn(
                'flex-1 text-center font-pretendard-medium text-[16px] leading-[24px]',
                selected ? 'text-brand-50' : 'text-gray-80',
              )}>
              {option.label}
            </Text>
          </SccPressable>
        );
      })}
    </View>
  );
};
