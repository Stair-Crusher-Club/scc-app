import {Controller, useFormContext} from 'react-hook-form';
import {Text, View} from 'react-native';

import PressableChip from '@/components/PressableChip';
import {SccButton} from '@/components/atoms';
import TextInput from '@/components/form/TextArea';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {LogClick} from '@/logging/LogClick';

import Question from '../components/Question';
import {
  ACCESSIBILITY_FEATURE_OPTIONS,
  ORDER_METHOD_OPTIONS,
  SEAT_TYPE_OPTIONS,
} from '../constants';
import {FormValues} from '../views/IndoorReviewView';
import * as S from './common.style';

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
    <S.Container>
      <S.Title>내부 이용 정보</S.Title>

      <View style={{gap: 36}}>
        <View style={{gap: 12}}>
          <Question required={true} multiple={true}>
            이 매장의 좌석 형태를 모두 알려주세요.
          </Question>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              gap: 8,
            }}>
            <Controller
              name="seatTypes"
              rules={{required: true, validate: value => value.size > 0}}
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
            <View style={{gap: 8}}>
              <Controller
                name="seatComment"
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
                      placeholder={'다른 유형의 좌석이 있다면 알려주세요!'}
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
          )}
        </View>

        <View style={{gap: 12}}>
          <Question required={true} multiple={true}>
            이 매장에서 주문은 어떻게 하나요?
          </Question>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              gap: 8,
            }}>
            <Controller
              name="orderMethods"
              rules={{required: true, validate: value => value.size > 0}}
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

        <View style={{gap: 12}}>
          <Question multiple={true}>
            공간에 대한 특이사항이 있다면 알려주세요.
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

        <View style={{gap: 10, paddingTop: 10}}>
          <LogClick elementName="place_review_form_save_button">
            <SccButton
              text="저장하기"
              isDisabled={!formState.isValid}
              style={{
                borderRadius: 10,
                backgroundColor: color.brand,
              }}
              fontSize={18}
              fontFamily={font.pretendardBold}
              onPress={onSave}
            />
          </LogClick>
          <LogClick elementName="place_review_form_save_and_toilet_review_button">
            <SccButton
              text="저장하고 화장실도 등록하기"
              isDisabled={!formState.isValid}
              style={{
                borderRadius: 10,
                backgroundColor: color.gray10,
              }}
              fontSize={18}
              textColor="black"
              fontFamily={font.pretendardMedium}
              onPress={onSaveAndToiletReview}
            />
          </LogClick>
        </View>
      </View>
    </S.Container>
  );
}
