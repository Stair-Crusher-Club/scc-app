import React, {useEffect, useState} from 'react';
import {Controller, useFormContext} from 'react-hook-form';
import {Pressable, View} from 'react-native';

import MinusIcon from '@/assets/icon/ic_minus.svg';
import PlusIcon from '@/assets/icon/ic_plus.svg';
import Options from '@/components/form/Options';
import TextInput from '@/components/form/TextInput';
import {color} from '@/constant/color';

import * as S from './FloorSection.style';

export enum FloorType {
  FirstFloor = 'firstFloor',
  NotFirstFloor = 'notFirstFloor',
  MultipleFloors = 'multipleFloors',
}

export default function FloorSection() {
  const {watch} = useFormContext<{floorType: FloorType}>();
  const floorType = watch('floorType');
  return (
    <S.FloorSection>
      <S.Header>
        <S.SectionTitle>층 정보</S.SectionTitle>
      </S.Header>
      <S.Label>1층에 있는 장소인가요?</S.Label>
      <Controller
        name="floorType"
        render={({field}) => (
          <Options
            value={field.value}
            columns={2}
            options={[
              {label: '네, 1층이에요', value: FloorType.FirstFloor},
              {label: '아니요', value: FloorType.NotFirstFloor},
              {
                label: '1~2층을 포함한 여러층이에요',
                value: FloorType.MultipleFloors,
              },
            ]}
            onSelect={field.onChange}
          />
        )}
      />
      {floorType === FloorType.MultipleFloors && (
        <View style={{marginTop: 30}}>
          <S.Label>2층 매장으로 가는 방법이 계단 뿐인가요?</S.Label>
          <Controller
            name="isStairOnlyOption"
            rules={{validate: v => typeof v === 'boolean'}}
            render={({field}) => (
              <Options
                value={field.value}
                options={[
                  {label: '네', value: true},
                  {label: '아니요', value: false},
                ]}
                onSelect={field.onChange}
              />
            )}
          />
        </View>
      )}
      {floorType === FloorType.NotFirstFloor && (
        <View style={{marginTop: 30}}>
          <S.Label>몇층에 있는 장소인가요?</S.Label>
          <Controller
            name="exactFloor"
            rules={{
              validate: v =>
                v !== 0 && v !== 1
                  ? true
                  : '층 정보 : 0층이나 1층은 입력할 수 없습니다.',
            }}
            render={({field}) => (
              <FloorSelect value={field.value} onChange={field.onChange} />
            )}
          />
        </View>
      )}
    </S.FloorSection>
  );
}

interface FloorSelectProps {
  value?: number;
  onChange: (value: number) => void;
}
function FloorSelect({value, onChange}: FloorSelectProps) {
  const [sign, setSign] = useState(value !== undefined ? value > 0 : true); // true means above ground
  const [floor, setFloor] = useState(value ? String(value) : '1');

  useEffect(() => {
    if (sign) {
      onChange(Number(floor));
    } else {
      onChange(-Number(floor));
    }
  }, [sign, floor]);

  function increase() {
    // 지상층
    if (sign) {
      setFloor(String(Number(floor) + 1));
      return;
    }
    // 지하층
    const newFloor = Number(floor) - 1;
    // -1층 -> 1층
    if (newFloor === 0) {
      setSign(true);
      setFloor('1');
    } else {
      setFloor(String(newFloor));
    }
  }

  function decrease() {
    // 지하층
    if (!sign) {
      setFloor(String(Number(floor) + 1));
      return;
    }
    // 지상층
    const newFloor = Number(floor) - 1;
    // 1층 -> -1층
    if (newFloor === 0) {
      setSign(false);
      setFloor('1');
    } else {
      setFloor(String(newFloor));
    }
  }

  return (
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
      <View style={{width: 160}}>
        <Options
          value={sign}
          options={[
            {label: '지상', value: true},
            {label: '지하', value: false},
          ]}
          onSelect={v => setSign(v)}
        />
      </View>
      <View style={{width: 16}} />
      <View style={{flex: 1}}>
        <View
          style={{
            position: 'absolute',
            zIndex: 1,
            left: 8,
            top: '50%',
            transform: 'translateY(-16px)',
          }}>
          <Pressable onPress={decrease} style={{padding: 8}}>
            <MinusIcon width={16} color={color.brandColor} />
          </Pressable>
        </View>
        <TextInput
          keyboardType="number-pad"
          value={floor}
          onChangeText={setFloor}
          placeholder="2"
          textAlign="center"
        />
        <View
          style={{
            position: 'absolute',
            zIndex: 1,
            right: 8,
            top: '50%',
            transform: 'translateY(-16px)',
          }}>
          <Pressable onPress={increase} style={{padding: 8}}>
            <PlusIcon width={16} color={color.brandColor} />
          </Pressable>
        </View>
      </View>
      <View style={{width: 12}} />
      <S.FloorUnit>층</S.FloorUnit>
    </View>
  );
}
