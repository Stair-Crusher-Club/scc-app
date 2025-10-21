import React from 'react';
import {Controller, useFormContext} from 'react-hook-form';
import {Text, View} from 'react-native';

import PressableChip from '@/components/PressableChip';
import Photos from '@/components/form/Photos';
import TextInput from '@/components/form/TextArea';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  makeRecommendedMobilityOptions,
  SPACIOUS_OPTIONS,
} from '@/constant/review';

import Question from '../components/Question';
import {FormValues} from '../views/IndoorReviewView';
import * as S from './common.style';

const MAX_NUMBER_OF_TAKEN_PHOTOS = 3;

export default function VisitorReviewSection() {
  const {watch} = useFormContext<FormValues>();
  const recommendedMobilityTypes = watch('recommendedMobilityTypes');
  return (
    <S.Container>
      <S.Title>방문 리뷰</S.Title>

      <View style={{gap: 36}}>
        <View style={{gap: 12}}>
          <Question required multiple>
            이 장소를 누구에게 추천하고 싶으신가요?
          </Question>
          {/* Chip */}
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              gap: 8,
            }}>
            <Controller
              name="recommendedMobilityTypes"
              rules={{
                validate: value =>
                  value.size > 0 || '추천하는 이동 수단을 선택해주세요',
              }}
              render={({field}) => (
                <>
                  {makeRecommendedMobilityOptions([
                    ...recommendedMobilityTypes,
                  ]).map(({label, value, disabled}) => (
                    <PressableChip
                      key={label}
                      label={label}
                      active={field.value?.has(value)}
                      disabled={disabled}
                      onPress={() => {
                        const newSet = new Set(field.value);
                        if (newSet.has(value)) {
                          newSet.delete(value);
                        } else {
                          newSet.add(value);
                        }
                        field.onChange(newSet);
                      }}
                    />
                  ))}
                </>
              )}
            />
          </View>
        </View>

        <View style={{gap: 12}}>
          <Question required>
            내부 공간, 휠체어나 유아차로 이용하기에 여유로운가요?
          </Question>
          {/* Chip */}
          <View style={{alignItems: 'flex-start', gap: 8}}>
            <Controller
              name="spaciousType"
              rules={{required: '공간의 여유로움을 선택해주세요'}}
              render={({field}) => (
                <>
                  {SPACIOUS_OPTIONS.map(({label, value}) => (
                    <PressableChip
                      key={value}
                      label={label}
                      active={field.value === value}
                      onPress={() => field.onChange(value)}
                    />
                  ))}
                </>
              )}
            />
          </View>
        </View>

        <View style={{gap: 12}}>
          <Question>장소 이용 경험을 알려주세요.</Question>
          <Controller
            name="indoorPhotos"
            rules={{required: false}}
            render={({field}) => (
              <Photos
                value={field.value ?? []}
                onChange={field.onChange}
                target="review"
                maxPhotos={MAX_NUMBER_OF_TAKEN_PHOTOS}
              />
            )}
          />

          <View style={{gap: 8}}>
            <Controller
              name="comment"
              render={({field}) => (
                <>
                  <TextInput
                    multiline
                    style={{
                      color: color.black,
                      fontSize: 16,
                      fontFamily: font.pretendardRegular,
                      paddingVertical: 0,
                      textAlignVertical: 'top',
                      minHeight: 160,
                    }}
                    value={field.value}
                    maxLength={300}
                    placeholder={
                      '편리했던 점이나 아쉬웠던 점을 자유롭게 적어주세요!'
                    }
                    placeholderTextColor={color.gray40}
                    onChangeText={field.onChange}
                  />
                  <Text
                    style={{
                      alignSelf: 'flex-end',
                      color: color.gray50,
                    }}>
                    {field.value?.length ?? 0}/300
                  </Text>
                </>
              )}
            />
          </View>
        </View>
      </View>
    </S.Container>
  );
}
