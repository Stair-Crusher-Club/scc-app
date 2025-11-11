import React from 'react';
import {SvgProps} from 'react-native-svg';

import * as S from './OptionsV2.style';

interface Option {
  label: string;
  icon?: React.ComponentType<SvgProps & {pointColor?: string}>;
  disabled?: boolean;
  value: any;
}
interface Props {
  value: any;
  options: Option[];
  columns?: 2 | 3; // 두줄로 혹은 세줄로 나열하기
  onSelect: (value: any) => void;
}
export default function OptionsV2({
  options,
  value,
  columns = 2,
  onSelect,
}: Props) {
  return (
    <S.Options>
      {options.map((option, i) => (
        <S.PressableOption
          key={i}
          elementName="option_single_select"
          disableLogging
          style={columns === 2 ? {width: '40%'} : {width: '30%'}}
          selected={option.value === value}
          disabled={option.disabled ?? false}
          onPress={() => onSelect(option.value)}>
          <S.OptionText selected={option.value === value}>
            {option.label}
          </S.OptionText>
        </S.PressableOption>
      ))}
    </S.Options>
  );
}

interface MultipleProps {
  values: any[];
  options: Option[];
  columns?: 2 | 3; // 두줄로 혹은 세줄로 나열하기
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

  return (
    <S.Options>
      {options.map((option, i) => {
        const selected = values?.includes(option.value);
        return (
          <S.PressableOption
            key={i}
            elementName="option_multi_select"
            disableLogging
            style={columns === 2 ? {width: '40%'} : {width: '30%'}}
            selected={selected}
            disabled={option.disabled ?? false}
            onPress={() => handleSelect(option.value)}>
            <S.OptionText selected={selected}>{option.label}</S.OptionText>
          </S.PressableOption>
        );
      })}
    </S.Options>
  );
};
