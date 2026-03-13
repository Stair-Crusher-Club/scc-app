import React from 'react';
import {Controller, useFormContext} from 'react-hook-form';
import {Text, View} from 'react-native';

import PressableChip from '@/components/PressableChip';
import {SccButton} from '@/components/atoms';
import TextInput from '@/components/form/TextArea';
import {color} from '@/constant/color';

import Question from '../components/Question';
import {
  ACCESSIBILITY_FEATURE_OPTIONS,
  ORDER_METHOD_OPTIONS,
  SEAT_TYPE_OPTIONS,
} from '../constants';
import {FormValues} from '../views/IndoorReviewView';

export default function IndoorInfoSection({
  onSave,
  onSaveAndToiletReview,
}: {
  onSave: () => void;
  onSaveAndToiletReview: () => void;
}) {
  const {formState, watch} = useFormContext<FormValues>();
  const seatTypes = watch('seatTypes');

  return (
    <View className="px-5 py-8 gap-6 bg-white">
      <Text className="font-pretendard-bold text-[20px] leading-[28px]">
        내부 이용 정보
      </Text>

      <View className="gap-9">
        <View className="gap-3">
          <Question required multiple>
            이 매장의 좌석 형태를 모두 알려주세요.
          </Question>
          <View className="flex-row flex-wrap items-start gap-2">
            <Controller
              name="seatTypes"
              rules={{
                validate: value => value.size > 0 || '좌석 형태를 선택해주세요',
              }}
              render={({field}) => (
                <>
                  {SEAT_TYPE_OPTIONS.map((label, idx) => (
                    <PressableChip
                      key={label + idx}
                      label={label}
                      active={field.value?.has(label)}
                      onPress={() => {
                        const newSet = new Set(field.value);
                        if (newSet.has(label)) {
                          newSet.delete(label);
                        } else {
                          newSet.add(label);
                        }
                        field.onChange(newSet);
                      }}
                    />
                  ))}
                </>
              )}
            />
          </View>

          {seatTypes.has('기타') && (
            <View className="gap-2">
              <Controller
                name="seatComment"
                render={({field}) => (
                  <>
                    <TextInput
                      multiline
                      style={{
                        color: color.black,
                        fontSize: 16,
                        paddingVertical: 0,
                        textAlignVertical: 'top',
                        minHeight: 160,
                      }}
                      className="font-pretendard-regular"
                      value={field.value}
                      maxLength={300}
                      placeholder={'다른 유형의 좌석이 있다면 알려주세요!'}
                      placeholderTextColor={color.gray40}
                      onChangeText={field.onChange}
                    />
                    <Text className="self-end text-gray-50">
                      {field.value?.length ?? 0}/300
                    </Text>
                  </>
                )}
              />
            </View>
          )}
        </View>

        <View className="gap-3">
          <Question required multiple>
            이 매장에서 주문은 어떻게 하나요?
          </Question>
          <View className="flex-row flex-wrap items-start gap-2">
            <Controller
              name="orderMethods"
              rules={{
                validate: value => value.size > 0 || '주문 방법을 선택해주세요',
              }}
              render={({field}) => (
                <>
                  {ORDER_METHOD_OPTIONS.map((label, idx) => (
                    <PressableChip
                      key={label + idx}
                      label={label}
                      active={field.value?.has(label)}
                      onPress={() => {
                        const newSet = new Set(field.value);
                        if (newSet.has(label)) {
                          newSet.delete(label);
                        } else {
                          newSet.add(label);
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

        <View className="gap-3">
          <Question multiple={true}>
            공간에 대한 특이사항이 있다면 알려주세요.
          </Question>
          {/* Chip */}
          <View className="flex-row flex-wrap items-start gap-2">
            <Controller
              name="features"
              render={({field}) => (
                <>
                  {ACCESSIBILITY_FEATURE_OPTIONS.map((label, idx) => (
                    <PressableChip
                      key={label + idx}
                      label={label}
                      active={field.value?.has(label)}
                      onPress={() => {
                        const newSet = new Set(field.value);
                        if (newSet.has(label)) {
                          newSet.delete(label);
                        } else {
                          newSet.add(label);
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

        <View className="gap-2.5 pt-2.5">
          <SccButton
            elementName="place_review_form_save_button"
            text="저장하기"
            style={{
              borderRadius: 10,
              backgroundColor: color.brand,
            }}
            isDisabled={!formState.isValid}
            fontSize={18}
            onPress={onSave}
          />
          <SccButton
            elementName="place_review_form_save_and_toilet_review_button"
            text="저장하고 화장실도 등록하기"
            isDisabled={!formState.isValid}
            style={{
              borderRadius: 10,
              backgroundColor: color.gray20,
            }}
            fontSize={18}
            textColor="gray90"
            onPress={onSaveAndToiletReview}
          />
        </View>
      </View>
    </View>
  );
}
