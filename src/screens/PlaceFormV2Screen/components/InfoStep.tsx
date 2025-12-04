import {SccButton} from '@/components/atoms';
import {SafeAreaWrapper} from '@/components/SafeAreaWrapper';
import {SccPressable} from '@/components/SccPressable';
import {colors} from '@/constant/colors';
import {MAX_NUMBER_OF_TAKEN_PHOTOS} from '@/constant/constant';
import {makeDoorTypeOptions} from '@/constant/options';
import {Place, StairHeightLevel, StairInfo} from '@/generated-sources/openapi';
import {useKeyboardVisible} from '@/hooks/useKeyboardVisible';
import useNavigation from '@/navigation/useNavigation';
import {Controller, useFormContext} from 'react-hook-form';
import {Image, ScrollView, View} from 'react-native';
import PlaceInfoSection from '../../PlaceReviewFormScreen/sections/PlaceInfoSection';
import {formImages} from '../constants';
import {
  GuideButton,
  GuideText,
  MeasureGuide,
  QuestionSection,
  QuestionText,
  SectionLabel,
  SectionSeparator,
  SubSection,
  SubmitButtonWrapper,
} from '../PlaceFormV2Screen';
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
  const navigation = useNavigation();
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
              <SubSection>
                <QuestionSection>
                  <SectionLabel>매장입구정보</SectionLabel>
                  <QuestionText>매장의 출입구가 어디쪽에 있나요?</QuestionText>
                </QuestionSection>
                <Controller
                  name="doorDirection"
                  rules={{required: true}}
                  render={({field}) => (
                    <View className="flex-row gap-[12px]">
                      <View className="flex-1 gap-[12px]">
                        <View
                          className="w-full rounded-[8px] overflow-hidden border border-gray-20"
                          style={{aspectRatio: 1}}>
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
                        <View
                          className="w-full rounded-[8px] overflow-hidden border border-gray-20"
                          style={{aspectRatio: 1}}>
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
              </SubSection>
            )}
            <SubSection>
              <QuestionText>출입구 사진을 등록해주세요</QuestionText>
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
            </SubSection>

            <SubSection>
              <QuestionText>입구에 계단이 있나요?</QuestionText>
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
              <GuideButton>
                <SccPressable
                  elementName="place_info_stair_guide"
                  onPress={() =>
                    navigation.navigate('Webview', {
                      fixedTitle: '계단 기준 알아보기',
                      url: 'https://agnica.notion.site/8312cc653a8f4b9aa8bc920bbd668218',
                    })
                  }>
                  <GuideText>계단 기준 알아보기 {'>'}</GuideText>
                </SccPressable>
              </GuideButton>
            </SubSection>

            {form.watch('hasStairs') &&
              form.watch('stairInfo') === StairInfo.One && (
                <SubSection key="stair-height">
                  <QuestionText>계단 1칸의 높이를 알려주세요</QuestionText>
                  <MeasureGuide>
                    <Image
                      source={formImages.stair}
                      className="w-full h-full"
                    />
                  </MeasureGuide>
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
                </SubSection>
              )}

            <SubSection>
              <QuestionText>입구에 경사로가 있나요?</QuestionText>
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
              <GuideButton>
                <SccPressable
                  elementName="place_info_slope_guide"
                  onPress={() =>
                    navigation.navigate('Webview', {
                      fixedTitle: '경사로 기준 알아보기',
                      url: 'https://agnica.notion.site/6f64035a062f41e28745faa4e7bd0770',
                    })
                  }>
                  <GuideText>경사로 기준 알아보기 {'>'}</GuideText>
                </SccPressable>
              </GuideButton>
            </SubSection>

            <SubSection>
              <QuestionText>출입문은 어떤 종류인가요?</QuestionText>
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
            </SubSection>

            <SubSection>
              <QuestionText>추가로 알려주실 내용이 있으신가요?</QuestionText>
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
            </SubSection>

            <SubSection>
              <QuestionText>더 도움이 될 정보가 있다면 알려주세요</QuestionText>
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
            </SubSection>
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
            style={{flex: 2}}
            isDisabled={!isFormValid}
          />
        </SubmitButtonWrapper>
      </SafeAreaWrapper>
    </>
  );
}
