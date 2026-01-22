import React from 'react';
import {Text, View} from 'react-native';

import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

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
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        gap: 8,
      }}>
      {options.map((option, idx) => {
        const selected = values?.includes(option.value);
        return (
          <SccPressable
            key={option.label + idx}
            elementName="option_chip"
            disableLogging
            style={{
              borderRadius: 14,
              borderWidth: 1.2,
              display: 'flex',
              flexDirection: 'row',
              gap: 5,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderColor: selected ? color.blue40 : color.gray20,
              backgroundColor: selected ? color.brand5 : color.white,
            }}
            onPress={() => handleSelect(option.value)}>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 16,
                lineHeight: 24,
                fontFamily: font.pretendardMedium,
                color: selected ? color.brand50 : color.gray80,
              }}>
              {option.label}
            </Text>
          </SccPressable>
        );
      })}
    </View>
  );
}
