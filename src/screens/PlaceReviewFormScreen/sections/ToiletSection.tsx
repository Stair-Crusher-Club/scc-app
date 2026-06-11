import React, {useEffect} from 'react';
import {Controller, useFormContext} from 'react-hook-form';
import {Text, View} from 'react-native';

import PressableChip from '@/components/PressableChip';
import {SccButton} from '@/components/atoms';
import Photos from '@/components/form/Photos';
import TextInput from '@/components/form/TextArea';
import {color} from '@/constant/color';
import {
  DOOR_TYPE_OPTIONS,
  TOILET_COMMENT_PLACEHOLDER,
  TOILET_LOCATION_COMMENT_PLACEHOLDER,
  TOILET_LOCATION_TYPE_OPTIONS,
  TOILET_PHOTO_GUIDE,
  TOILET_SECTION_TITLE,
} from '@/constant/review';

import FloorSelect from '../components/FloorSelect';
import Question from '../components/Question';
import {FormValues} from '../views/ToiletReviewView';

const MAX_NUMBER_OF_TAKEN_PHOTOS = 3;

export default function ToiletSection({onSave}: {onSave: () => void}) {
  const {watch, formState, resetField} = useFormContext<FormValues>();
  const toiletLocationType = watch('toiletLocationType');

  const isExist =
    toiletLocationType === 'PLACE' || toiletLocationType === 'BUILDING';
  const isVisibleTextarea = toiletLocationType === 'ETC' || isExist;

  useEffect(() => {
    if (!isExist) {
      resetField('floor');
      resetField('doorTypes');
      resetField('toiletPhotos');
      resetField('locationComment');
    }
  }, [toiletLocationType]);

  return (
    <View className="px-5 py-8 gap-6 bg-white flex-1 justify-between">
      <View className="gap-6">
        <Text className="font-pretendard-bold text-[20px] leading-[28px]">
          {TOILET_SECTION_TITLE}
        </Text>

        <View className="gap-3">
          <Question required>장애인 화장실이 있나요?</Question>
          <Text className="font-pretendard-regular text-[14px] leading-[20px] text-gray-70">
            휠체어 사용자도 이용 가능한 화장실인 경우에만 '있음'으로
            선택해주세요.
          </Text>
          <View className="flex-row flex-wrap items-start gap-2">
            <Controller
              name="toiletLocationType"
              rules={{required: true}}
              render={({field}) => (
                <>
                  {TOILET_LOCATION_TYPE_OPTIONS.map(({label, value}) => (
                    <PressableChip
                      key={label}
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

        {isExist && (
          <>
            <View className="gap-3">
              <Question required>몇층에 있는 장소인가요?</Question>
              <Controller
                name="floor"
                rules={{
                  required: isExist,
                  validate: v =>
                    v !== 0 ? true : '층 정보 : 0층은 입력할 수 없습니다.',
                }}
                render={({field}) => (
                  <FloorSelect value={field.value} onChange={field.onChange} />
                )}
              />
            </View>
            <View className="gap-3">
              <Question required>출입문 유형을 알려주세요.</Question>
              <View className="flex-row flex-wrap items-start gap-2">
                <Controller
                  name="doorTypes"
                  rules={{
                    required: isExist,
                  }}
                  render={({field}) => (
                    <>
                      {DOOR_TYPE_OPTIONS.map(({label, value}) => {
                        return (
                          <PressableChip
                            key={value}
                            label={label}
                            active={field.value === value}
                            onPress={() => field.onChange(value)}
                          />
                        );
                      })}
                    </>
                  )}
                />
              </View>
            </View>
          </>
        )}
        <View className="gap-3">
          {isExist && (
            <>
              <Question required>화장실 사진을 촬영해 주세요.</Question>
              <Text className="font-pretendard-regular text-[14px] leading-[20px] text-gray-70">
                {TOILET_PHOTO_GUIDE}
              </Text>
            </>
          )}
          {isExist && (
            <Controller
              name="toiletPhotos"
              rules={{
                validate: photos =>
                  (photos?.length ?? 0) > 0 || '사진을 1장 이상 등록해 주세요.',
              }}
              render={({field}) => (
                <Photos
                  value={field.value ?? []}
                  onChange={field.onChange}
                  target="toilet"
                  maxPhotos={MAX_NUMBER_OF_TAKEN_PHOTOS}
                />
              )}
            />
          )}
          {isExist && (
            <View className="gap-2">
              <Question>화장실 위치 혹은 가는 방법을 알려주세요.</Question>
              <Controller
                name="locationComment"
                render={({field}) => (
                  <>
                    <TextInput
                      multiline
                      style={{
                        color: color.black,
                        fontSize: 16,
                        paddingVertical: 0,
                        textAlignVertical: 'top',
                        minHeight: 80,
                      }}
                      className="font-pretendard-regular"
                      value={field.value}
                      maxLength={300}
                      placeholder={TOILET_LOCATION_COMMENT_PLACEHOLDER}
                      placeholderTextColor={color.gray50}
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
          {(isExist || isVisibleTextarea) && (
            <View className="gap-2">
              {isExist && (
                <Question>그외 알려주고 싶은 부분을 적어주세요.</Question>
              )}
              <Controller
                name="comment"
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
                      placeholder={
                        toiletLocationType === 'ETC'
                          ? '기타 사항을 작성해주세요.'
                          : TOILET_COMMENT_PLACEHOLDER
                      }
                      placeholderTextColor={color.gray50}
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
      </View>

      <View className="gap-2.5 pt-2.5">
        <SccButton
          elementName="place_review_form_save_button"
          text="저장하기"
          style={{
            borderRadius: 10,
            backgroundColor: color.brand,
          }}
          fontSize={18}
          isDisabled={!formState.isValid}
          onPress={onSave}
        />
      </View>
    </View>
  );
}
