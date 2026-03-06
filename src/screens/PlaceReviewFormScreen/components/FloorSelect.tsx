import React, {useEffect, useState} from 'react';
import {Text, TextInput, View} from 'react-native';

import {SccPressable} from '@/components/SccPressable';
import MinusIcon from '@/assets/icon/ic_minus.svg';
import PlusIcon from '@/assets/icon/ic_plus.svg';
import PressableChip from '@/components/PressableChip';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

interface FloorSelectProps {
  value?: number;
  onChange: (value: number) => void;
}
export default function FloorSelect({value, onChange}: FloorSelectProps) {
  const [sign, setSign] = useState(value !== undefined ? value > 0 : true);
  const [floor, setFloor] = useState(value ? String(Math.abs(value)) : '1');

  useEffect(() => {
    if (sign) {
      onChange(Number(floor));
    } else {
      onChange(-Number(floor));
    }
  }, [sign, floor]);

  const numFloor = Number(floor);
  const isDecreaseDisabled = numFloor <= 1;

  function increase() {
    setFloor(String(numFloor + 1));
  }

  function decrease() {
    if (numFloor <= 1) {
      return;
    }
    setFloor(String(numFloor - 1));
  }

  return (
    <View style={{flexDirection: 'row', alignItems: 'center', gap: 20}}>
      <View style={{flexDirection: 'row', gap: 8}}>
        <PressableChip
          label="지상"
          active={sign}
          onPress={() => setSign(true)}
        />
        <PressableChip
          label="지하"
          active={!sign}
          onPress={() => setSign(false)}
        />
      </View>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
        }}>
        <View
          style={{
            flex: 1,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: '#DCDEE3',
            borderRadius: 12,
            height: 40,
            maxWidth: 140,
          }}>
          <SccPressable
            elementName="floor_select_decrease_button"
            onPress={decrease}
            disabled={isDecreaseDisabled}
            style={{
              position: 'absolute',
              zIndex: 1,
              left: 0,
              top: '50%',
              transform: 'translateY(-20px)',
              backgroundColor: '#F7F7F9',
              width: 36,
              height: 40,
              justifyContent: 'center',
              alignItems: 'center',
              opacity: isDecreaseDisabled ? 0.3 : 1,
            }}>
            <MinusIcon width={16} color={'#383841'} />
          </SccPressable>
          <TextInput
            keyboardType="number-pad"
            value={floor}
            onChangeText={setFloor}
            placeholder="1"
            textAlign="center"
            style={{
              color: color.black,
              fontSize: 16,
              fontFamily: font.pretendardRegular,
              paddingVertical: 0,
              height: 40,
            }}
          />
          <SccPressable
            elementName="floor_select_increase_button"
            onPress={increase}
            style={{
              position: 'absolute',
              zIndex: 1,
              right: 0,
              top: '50%',
              transform: 'translateY(-20px)',
              backgroundColor: '#F7F7F9',
              width: 36,
              height: 40,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <PlusIcon width={16} color={'#383841'} />
          </SccPressable>
        </View>
        <Text
          style={{
            fontSize: 15,
            lineHeight: 22,
            fontFamily: font.pretendardMedium,
          }}>
          층
        </Text>
      </View>
    </View>
  );
}
