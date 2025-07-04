import {useEffect} from 'react';
import {Controller, useFormContext} from 'react-hook-form';
import {Text, View} from 'react-native';

import PressableChip from '@/components/PressableChip';
import {SccButton} from '@/components/atoms';
import Photos from '@/components/form/Photos';
import TextInput from '@/components/form/TextArea';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {makeDoorTypeOptions} from '@/constant/options';
import {TOILET_LOCATION_TYPE_OPTIONS} from '@/constant/review';

import FloorSelect from '../components/FloorSelect';
import {FormValues} from '../views/ToiletReviewView';
import * as S from './common.style';

const MAX_NUMBER_OF_TAKEN_PHOTOS = 3;

export default function ToiletSection({onSave}: {onSave: () => void}) {
  const {watch, formState, resetField} = useFormContext<FormValues>();
  const toiletLocationType = watch('toiletLocationType');
  const doorTypes = watch('doorTypes');

  const isExist =
    toiletLocationType === 'PLACE' || toiletLocationType === 'BUILDING';
  const isVisibleTextarea = toiletLocationType === 'ETC' || isExist;

  useEffect(() => {
    if (!isExist) {
      resetField('floor');
      resetField('doorTypes');
      resetField('toiletPhotos');
    }
  }, [toiletLocationType]);

  return (
    <S.Container style={{flex: 1, justifyContent: 'space-between'}}>
      <View style={{gap: 24}}>
        <S.Title>장애인 화장실 정보</S.Title>

        <View style={{gap: 12}}>
          <S.Question>
            <Text style={{color: color.red}}>* </Text>장애인 화장실의 유무를
            알려주세요.
          </S.Question>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              gap: 8,
            }}>
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
            <View style={{gap: 12}}>
              <S.Question>
                <Text style={{color: color.red}}>* </Text>몇층에 있는
                장소인가요?
              </S.Question>
              <Controller
                name="floor"
                rules={{
                  required: isExist,
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
            <View style={{gap: 12}}>
              <S.Question>
                <Text style={{color: color.red}}>* </Text>출입문 유형을
                알려주세요
                <Text style={{color: '#A1A1AF'}}> (중복선택)</Text>
              </S.Question>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  alignItems: 'flex-start',
                  gap: 8,
                }}>
                <Controller
                  name="doorTypes"
                  rules={{
                    required: isExist,
                    validate: value => value.size > 0,
                  }}
                  render={({field}) => (
                    <>
                      {makeDoorTypeOptions([...doorTypes]).map(
                        ({label, value, disabled}) => {
                          return (
                            <PressableChip
                              key={value}
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
                          );
                        },
                      )}
                    </>
                  )}
                />
              </View>
            </View>
            <View style={{gap: 12}}>
              <S.Question>
                화장실 이용 경험 및 참고할점을 알려주세요.
              </S.Question>
              <Controller
                name="toiletPhotos"
                rules={{required: false}}
                render={({field}) => (
                  <Photos
                    value={field.value ?? []}
                    onChange={field.onChange}
                    target="place"
                    maxPhotos={MAX_NUMBER_OF_TAKEN_PHOTOS}
                  />
                )}
              />
            </View>
          </>
        )}

        {isVisibleTextarea && (
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
                      '장소의 전체적인 접근성, 방문 경험을 나눠주세요.'
                    }
                    placeholderTextColor={color.gray50}
                    onChangeText={field.onChange}
                  />
                  <Text
                    style={{
                      alignSelf: 'flex-end',
                      color: '#7A7A88',
                    }}>
                    {field.value?.length ?? 0}/300
                  </Text>
                </>
              )}
            />
          </View>
        )}
      </View>

      <View
        style={{
          gap: 10,
          paddingTop: 10,
        }}>
        <SccButton
          text="저장하기"
          style={{
            borderRadius: 10,
            backgroundColor: color.brand,
          }}
          fontSize={18}
          isDisabled={!formState.isValid}
          fontFamily={font.pretendardBold}
          onPress={onSave}
        />
      </View>
    </S.Container>
  );
}
