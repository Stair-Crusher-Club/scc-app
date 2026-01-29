import {SccButton} from '@/components/atoms';
import {SafeAreaWrapper} from '@/components/SafeAreaWrapper';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {MAX_NUMBER_OF_TAKEN_PHOTOS} from '@/constant/constant';
import {font} from '@/constant/font';
import {makeDoorTypeOptions} from '@/constant/options';
import {Place, StairHeightLevel, StairInfo} from '@/generated-sources/openapi';
import {useKeyboardVisible} from '@/hooks/useKeyboardVisible';
import useNavigation from '@/navigation/useNavigation';
import ToastUtils from '@/utils/ToastUtils';
import {Controller, useFormContext} from 'react-hook-form';
import {Image, ScrollView, View} from 'react-native';
import styled from 'styled-components/native';
import PlaceInfoSection from '../../PlaceReviewFormScreen/sections/PlaceInfoSection';
import {FORM_TOAST_OPTIONS, formImages} from '../constants';
import {
  GuideButton,
  GuideText,
  Hint,
  Label,
  MeasureGuide,
  OptionsGroup,
  QuestionSection,
  QuestionText,
  RequiredMark,
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

  type FormErrorKey =
    | 'doorDirection'
    | 'entrancePhotos'
    | 'hasStairs'
    | 'stairInfo'
    | 'entranceStairHeightLevel'
    | 'hasSlope'
    | 'doorType';

  const noticeError = (errorKey: FormErrorKey) => {
    switch (errorKey) {
      case 'doorDirection':
        ToastUtils.show('매장 입구 방향을 선택해주세요.', FORM_TOAST_OPTIONS);
        break;
      case 'entrancePhotos':
        ToastUtils.show('출입구 사진을 등록해주세요.', FORM_TOAST_OPTIONS);
        break;
      case 'hasStairs':
      case 'stairInfo':
      case 'entranceStairHeightLevel':
        ToastUtils.show('계단 정보를 입력해주세요.', FORM_TOAST_OPTIONS);
        break;
      case 'hasSlope':
        ToastUtils.show('경사로 정보를 입력해주세요.', FORM_TOAST_OPTIONS);
        break;
      case 'doorType':
        ToastUtils.show('출입문 종류를 선택해주세요.', FORM_TOAST_OPTIONS);
        break;
      default:
        ToastUtils.show('필수 정보를 입력해주세요.', FORM_TOAST_OPTIONS);
    }
  };

  // 유효성 검사 및 첫 번째 에러 키 반환
  const validateAndGetError = (): FormErrorKey | null => {
    // 단독건물이 아닐 경우 매장 입구 방향 필수
    if (!isStandaloneBuilding && !doorDirection) {
      return 'doorDirection';
    }

    // 출입구 사진은 필수
    if (!entrancePhotos || entrancePhotos.length === 0) {
      return 'entrancePhotos';
    }

    // 계단 여부는 필수 (boolean)
    if (typeof hasStairs !== 'boolean') {
      return 'hasStairs';
    }

    // 계단이 있을 경우 계단 정보 필수
    if (hasStairs && !stairInfo) {
      return 'stairInfo';
    }

    // 계단이 1칸일 경우 높이 정보 필수
    if (hasStairs && stairInfo === StairInfo.One && !entranceStairHeightLevel) {
      return 'entranceStairHeightLevel';
    }

    // 경사로 여부는 필수 (boolean)
    if (typeof hasSlope !== 'boolean') {
      return 'hasSlope';
    }

    // 출입문 종류는 필수
    if (!doorType || doorType.length === 0) {
      return 'doorType';
    }

    return null;
  };

  // 다음/등록 버튼 핸들러
  const handleSubmit = () => {
    const errorKey = validateAndGetError();
    if (errorKey) {
      noticeError(errorKey);
      return;
    }
    onSubmit();
  };

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

          <InfoFormContainer>
            {!isStandaloneBuilding && (
              <SubSection>
                <QuestionSection>
                  <SectionLabel>매장입구정보</SectionLabel>
                  <QuestionText>
                    매장의 출입구가 어디쪽에 있나요?{' '}
                    <RequiredMark>*</RequiredMark>
                  </QuestionText>
                </QuestionSection>
                <Controller
                  name="doorDirection"
                  rules={{required: true}}
                  render={({field}) => (
                    <DoorDirectionContainer>
                      <DoorDirectionOption
                        disabled={field.value && field.value !== 'outside'}>
                        <DoorDirectionImageContainer>
                          <Image
                            source={formImages.entrance.out}
                            style={{width: '100%', height: '100%'}}
                            resizeMode="cover"
                          />
                        </DoorDirectionImageContainer>
                        <OptionsV2
                          value={field.value}
                          columns={1}
                          options={[{label: '건물 밖', value: 'outside'}]}
                          onSelect={field.onChange}
                        />
                      </DoorDirectionOption>
                      <DoorDirectionOption
                        disabled={field.value && field.value !== 'inside'}>
                        <DoorDirectionImageContainer>
                          <Image
                            source={formImages.entrance.in}
                            style={{width: '100%', height: '100%'}}
                            resizeMode="cover"
                          />
                        </DoorDirectionImageContainer>
                        <OptionsV2
                          value={field.value}
                          columns={1}
                          options={[{label: '건물 안', value: 'inside'}]}
                          onSelect={field.onChange}
                        />
                      </DoorDirectionOption>
                    </DoorDirectionContainer>
                  )}
                />
              </SubSection>
            )}
            <SubSection>
              <View style={{gap: 2}}>
                <Label>
                  출입구 사진을 등록해주세요 <RequiredMark>*</RequiredMark>
                </Label>
                <Hint>최대 3장까지 등록 가능해요</Hint>
              </View>
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
              <Label>
                입구에 계단이 있나요? <RequiredMark>*</RequiredMark>
              </Label>
              <OptionsGroup>
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
              </OptionsGroup>
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
                  <Label>
                    계단 1칸의 높이를 알려주세요 <RequiredMark>*</RequiredMark>
                  </Label>
                  <MeasureGuide>
                    <Image
                      source={formImages.stair}
                      style={{width: '100%', height: '100%'}}
                    />
                  </MeasureGuide>
                  <View style={{gap: 16}}>
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
              <Label>
                입구에 경사로가 있나요? <RequiredMark>*</RequiredMark>
              </Label>
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
              <Label>
                출입문은 어떤 종류인가요? <RequiredMark>*</RequiredMark>
              </Label>
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
              <View style={{gap: 2}}>
                <Label>추가로 알려주실 내용이 있으신가요?</Label>
                <Hint>중복선택이 가능해요</Hint>
              </View>
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
              <Label>더 도움이 될 정보가 있다면 알려주세요</Label>
              <Controller
                name="comment"
                render={({field}) => (
                  <TextAreaV2
                    placeholder="예시) 후문에는 계단이 없어 편하게 갈 수 있습니다"
                    value={field.value}
                    onChangeText={field.onChange}
                  />
                )}
              />
            </SubSection>
          </InfoFormContainer>
        </SafeAreaWrapper>
      </ScrollView>
      <SafeAreaWrapper edges={isKeyboardVisible ? [] : ['bottom']}>
        <SubmitButtonWrapper>
          <SccButton
            text="이전"
            onPress={onBack}
            buttonColor="gray20"
            textColor="gray90"
            fontFamily={font.pretendardSemibold}
            elementName="place_form_v2_info_prev"
            style={{flex: 1, borderRadius: 12}}
          />
          <SccButton
            text={hasFloorMovementStep ? '다음' : '등록하기'}
            onPress={handleSubmit}
            fontFamily={font.pretendardSemibold}
            buttonColor="brandColor"
            elementName={
              hasFloorMovementStep
                ? 'place_form_v2_info_next'
                : 'place_form_v2_submit'
            }
            style={{flex: 2, borderRadius: 12}}
          />
        </SubmitButtonWrapper>
      </SafeAreaWrapper>
    </>
  );
}

const InfoFormContainer = styled.View`
  background-color: white;
  padding-vertical: 40px;
  padding-horizontal: 20px;
  gap: 60px;
`;

const DoorDirectionContainer = styled.View`
  flex-direction: row;
  gap: 8px;
`;

const DoorDirectionOption = styled.View<{disabled?: boolean}>`
  flex: 1;
  gap: 8px;
  opacity: ${({disabled}) => (disabled ? 0.3 : 1)};
`;

const DoorDirectionImageContainer = styled.View`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border-width: 1px;
  border-color: ${color.gray20};
`;
