import React from 'react';

import * as S from './MultiSelect.style';

interface Option {
  label: string;
  value: any;
}
interface Props {
  label?: string;
  optional?: 'required' | 'optional';
  values?: any[];
  options: Option[];
  onSelect: (value: any) => void;
}
export default function MultiSelect({
  label,
  optional,
  options,
  values = [],
  onSelect,
}: Props) {
  function handleSelect(value: any) {
    if (values.includes(value)) {
      onSelect(values.filter(v => v !== value));
    } else {
      onSelect([...values, value]);
    }
  }
  return (
    <S.MultiSelectContainer>
      <S.LabelWrapper>
        {optional === 'required' && <S.LabelPoint>*</S.LabelPoint>}
        <S.Label>{label}</S.Label>
        {optional === 'optional' && <S.Optional>(선택)</S.Optional>}
        {optional === 'required' && <S.Optional>(필수)</S.Optional>}
      </S.LabelWrapper>
      <S.Options>
        {options.map((option, i) => (
          <S.PressableOption
            key={i}
            selected={values.includes(option.value)}
            onPress={() => handleSelect(option.value)}>
            <S.OptionText selected={values.includes(option.value)}>
              {option.label}
            </S.OptionText>
          </S.PressableOption>
        ))}
      </S.Options>
    </S.MultiSelectContainer>
  );
}
