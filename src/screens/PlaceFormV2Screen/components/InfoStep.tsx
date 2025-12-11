import {SccButton} from '@/components/atoms';
import {SafeAreaWrapper} from '@/components/SafeAreaWrapper';
import {MAX_NUMBER_OF_TAKEN_PHOTOS} from '@/constant/constant';
import {makeDoorTypeOptions} from '@/constant/options';
import {Place, StairHeightLevel, StairInfo} from '@/generated-sources/openapi';
import {useKeyboardVisible} from '@/hooks/useKeyboardVisible';
import {Controller, useFormContext} from 'react-hook-form';
import {Image, ScrollView, View} from 'react-native';
import PlaceInfoSection from '../../PlaceReviewFormScreen/sections/PlaceInfoSection';
import {formImages} from '../constants';
import FormQuestion from './FormQuestion';
import {SectionSeparator, SubmitButtonWrapper} from './FormStyles';
import GuideLink from './GuideLink';
import MeasureGuide from './MeasureGuide';
import OptionsChip from './OptionsChip';
import OptionsV2 from './OptionsV2';
import PhotosV2 from './PhotosV2';
import TextAreaV2 from './TextAreaV2';

interface InfoStepProps {
  place: Place;
  isStandaloneBuilding: boolean;
  hasFloorMovementStep: boolean;
  onSubmit: () => void;
  onBack: () => void;
}

export default function InfoStep({
  place,
  isStandaloneBuilding,
  hasFloorMovementStep,
  onSubmit,
  onBack,
}: InfoStepProps) {
  const form = useFormContext();
  const isKeyboardVisible = useKeyboardVisible();

  // Watch all required fields
  const doorDirection = form.watch('doorDirection');
  const entrancePhotos = form.watch('entrancePhotos');
  const hasStairs = form.watch('hasStairs');
  const stairInfo = form.watch('stairInfo');
  const entranceStairHeightLevel = form.watch('entranceStairHeightLevel');
  const hasSlope = form.watch('hasSlope');
  const doorType = form.watch('doorType');

  // Check if all required fields are filled
  const isFormValid = (() => {
    // 출입구 사진은 필수
    if (!entrancePhotos || entrancePhotos.length === 0) {
      return false;
    }

    // 단독건물이 아닐 경우 매장 입구 방향 필수
    if (!isStandaloneBuilding && !doorDirection) {
      return false;
    }

    // 계단 여부는 필수 (boolean)
    if (typeof hasStairs !== 'boolean') {
      return false;
    }

    // 계단이 있을 경우 계단 정보 필수
    if (hasStairs && !stairInfo) {
      return false;
    }

    // 계단이 1칸일 경우 높이 정보 필수
    if (hasStairs && stairInfo === StairInfo.One && !entranceStairHeightLevel) {
      return false;
    }

    // 경사로 여부는 필수 (boolean)
    if (typeof hasSlope !== 'boolean') {
      return false;
    }

    // 출입문 종류는 필수
    if (!doorType || doorType.length === 0) {
      return false;
    }

    return true;
  })();

  return (
    <>
      <ScrollView>
        <SafeAreaWrapper edges={['bottom']}>
          <PlaceInfoSection
            target="place"
            name={place.name}
            address={place.address}
          />
          <SectionSeparator />

          <View className="bg-white py-[40px] px-[20px] gap-[48px]">
            {!isStandaloneBuilding && (
              <FormQuestion
                label="매장입구정보"
                question="매장의 출입구가 어디쪽에 있나요?">
                <Controller
                  name="doorDirection"
                  rules={{required: true}}
                  render={({field}) => (
                    <View className="flex-row gap-[12px]">
                      <View className="flex-1 gap-[12px]">
                        <View className="w-full rounded-[8px] overflow-hidden border border-gray-20 aspect-square">
                          <Image
                            source={formImages.entrance.out}
                            className="w-full h-full"
                            resizeMode="cover"
                          />
                        </View>
                        <OptionsV2
                          value={field.value}
                          columns={1}
                          options={[{label: '건물 밖', value: 'outside'}]}
                          onSelect={field.onChange}
                        />
                      </View>
                      <View className="flex-1 gap-[12px]">
                        <View className="w-full rounded-[8px] overflow-hidden border border-gray-20 aspect-square">
                          <Image
                            source={formImages.entrance.in}
                            className="w-full h-full"
                            resizeMode="cover"
                          />
                        </View>
                        <OptionsV2
                          value={field.value}
                          columns={1}
                          options={[{label: '건물 안', value: 'inside'}]}
                          onSelect={field.onChange}
                        />
                      </View>
                    </View>
                  )}
                />
              </FormQuestion>
            )}
            <FormQuestion question="출입구 사진을 등록해주세요">
              <Controller
                name="entrancePhotos"
                rules={{required: true}}
                render={({field}) => (
                  <PhotosV2
                    value={field.value ?? []}
                    onChange={field.onChange}
                    target="place"
                    maxPhotos={MAX_NUMBER_OF_TAKEN_PHOTOS}
                  />
                )}
              />
            </FormQuestion>

            <FormQuestion question="입구에 계단이 있나요?">
              <Controller
                name="hasStairs"
                rules={{validate: v => typeof v === 'boolean'}}
                render={({field}) => (
                  <OptionsV2
                    value={field.value}
                    options={[
                      {label: '있어요', value: true},
                      {label: '없어요', value: false},
                    ]}
                    onSelect={field.onChange}
                  />
                )}
              />
              {form.watch('hasStairs') && (
                <Controller
                  name="stairInfo"
                  rules={{required: true}}
                  render={({field}) => (
                    <OptionsV2
                      value={field.value}
                      columns={3}
                      options={[
                        {label: '1칸', value: StairInfo.One},
                        {label: '2-5칸', value: StairInfo.TwoToFive},
                        {label: '6칸 이상', value: StairInfo.OverSix},
                      ]}
                      onSelect={field.onChange}
                    />
                  )}
                />
              )}
              <GuideLink type="stairs" elementName="place_info_stair_guide" />
            </FormQuestion>

            {form.watch('hasStairs') &&
              form.watch('stairInfo') === StairInfo.One && (
                <FormQuestion
                  key="stair-height"
                  question="계단 1칸의 높이를 알려주세요">
                  <MeasureGuide source={formImages.stair} />
                  <View className="gap-[16px]">
                    <Controller
                      name="entranceStairHeightLevel"
                      rules={{required: true}}
                      render={({field}) => (
                        <OptionsV2
                          value={field.value}
                          options={[
                            {
                              label: '엄지 한마디',
                              value: StairHeightLevel.HalfThumb,
                            },
                            {
                              label: '엄지 손가락',
                              value: StairHeightLevel.Thumb,
                            },
                            {
                              label: '엄지 손가락 이상',
                              value: StairHeightLevel.OverThumb,
                            },
                          ]}
                          onSelect={field.onChange}
                        />
                      )}
                    />
                  </View>
                </FormQuestion>
              )}

            <FormQuestion question="입구에 경사로가 있나요?">
              <Controller
                name="hasSlope"
                rules={{validate: v => typeof v === 'boolean'}}
                render={({field}) => (
                  <OptionsV2
                    value={field.value}
                    options={[
                      {label: '있어요', value: true},
                      {label: '없어요', value: false},
                    ]}
                    onSelect={field.onChange}
                  />
                )}
              />
              <GuideLink type="slope" elementName="place_info_slope_guide" />
            </FormQuestion>

            <FormQuestion question="출입문은 어떤 종류인가요?">
              <Controller
                name="doorType"
                rules={{required: true}}
                render={({field}) => (
                  <OptionsV2.Multiple
                    values={field.value}
                    columns={3}
                    options={makeDoorTypeOptions(form.watch('doorType') ?? [])}
                    onSelect={field.onChange}
                  />
                )}
              />
            </FormQuestion>

            <FormQuestion question="추가로 알려주실 내용이 있으신가요?">
              <Controller
                name="additionalInfo"
                render={({field}) => (
                  <OptionsChip
                    values={field.value ?? []}
                    options={[
                      {label: '배달전문점이에요', value: '배달전문점이에요'},
                      {
                        label: '테이크아웃만 가능해요',
                        value: '테이크아웃만 가능해요',
                      },
                    ]}
                    onSelect={field.onChange}
                  />
                )}
              />
            </FormQuestion>

            <FormQuestion question="더 도움이 될 정보가 있다면 알려주세요">
              <Controller
                name="comment"
                render={({field}) => (
                  <TextAreaV2
                    placeholder="예시: 입구가 골목 안쪽이에요"
                    value={field.value}
                    onChangeText={field.onChange}
                  />
                )}
              />
            </FormQuestion>
          </View>
        </SafeAreaWrapper>
      </ScrollView>
      <SafeAreaWrapper edges={isKeyboardVisible ? [] : ['bottom']}>
        <SubmitButtonWrapper>
          <SccButton
            text="이전"
            onPress={onBack}
            buttonColor="gray10"
            textColor="black"
            fontWeight="500"
            elementName="place_form_v2_info_prev"
            style={{flex: 1}}
          />
          <SccButton
            text={hasFloorMovementStep ? '다음' : '등록하기'}
            onPress={onSubmit}
            buttonColor="brandColor"
            elementName={
              hasFloorMovementStep
                ? 'place_form_v2_info_next'
                : 'place_form_v2_submit'
            }
            fontWeight="600"
            style={{flex: 2}}
            isDisabled={!isFormValid}
          />
        </SubmitButtonWrapper>
      </SafeAreaWrapper>
    </>
  );
}
