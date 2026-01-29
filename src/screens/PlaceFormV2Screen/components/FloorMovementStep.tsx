import {SccButton} from '@/components/atoms';
import {SafeAreaWrapper} from '@/components/SafeAreaWrapper';
import {MAX_NUMBER_OF_TAKEN_PHOTOS} from '@/constant/constant';
import {font} from '@/constant/font';
import {
  FloorMovingMethodTypeDto,
  Place,
  StairHeightLevel,
  StairInfo,
} from '@/generated-sources/openapi';
import {useKeyboardVisible} from '@/hooks/useKeyboardVisible';
import ToastUtils from '@/utils/ToastUtils';
import {Controller, useFormContext} from 'react-hook-form';
import {Image, ScrollView, View} from 'react-native';
import styled from 'styled-components/native';
import PlaceInfoSection from '../../PlaceReviewFormScreen/sections/PlaceInfoSection';
import {
  FORM_TOAST_OPTIONS,
  formImages,
  makeFloorMovementOptions,
} from '../constants';
import {
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
import OptionsV2 from './OptionsV2';
import PhotosV2 from './PhotosV2';
import TextAreaV2 from './TextAreaV2';

interface FloorMovementStepProps {
  place: Place;
  isStandaloneBuilding: boolean;
  onSubmit: () => void;
  onBack: () => void;
}

export default function FloorMovementStep({
  place,
  isStandaloneBuilding,
  onSubmit,
  onBack,
}: FloorMovementStepProps) {
  const form = useFormContext();
  const isKeyboardVisible = useKeyboardVisible();

  // Watch all required fields
  const floorMovementMethods: FloorMovingMethodTypeDto[] =
    form.watch('floorMovementMethod') ?? [];
  const elevatorPhotos = form.watch('elevatorPhotos');
  const elevatorHasStairs = form.watch('elevatorHasStairs');
  const elevatorStairInfo = form.watch('elevatorStairInfo');
  const elevatorStairHeightLevel = form.watch('elevatorStairHeightLevel');
  const elevatorHasSlope = form.watch('elevatorHasSlope');

  type FormErrorKey =
    | 'floorMovementMethod'
    | 'elevatorPhotos'
    | 'elevatorHasStairs'
    | 'elevatorStairInfo'
    | 'elevatorStairHeightLevel'
    | 'elevatorHasSlope';

  const noticeError = (errorKey: FormErrorKey) => {
    switch (errorKey) {
      case 'floorMovementMethod':
        ToastUtils.show('층간 이동 방법을 선택해주세요.', FORM_TOAST_OPTIONS);
        break;
      case 'elevatorPhotos':
        ToastUtils.show('엘리베이터 사진을 등록해주세요.', FORM_TOAST_OPTIONS);
        break;
      case 'elevatorHasStairs':
      case 'elevatorStairInfo':
      case 'elevatorStairHeightLevel':
        ToastUtils.show('계단 정보를 입력해주세요.', FORM_TOAST_OPTIONS);
        break;
      case 'elevatorHasSlope':
        ToastUtils.show('경사로 정보를 입력해주세요.', FORM_TOAST_OPTIONS);
        break;
      default:
        ToastUtils.show('필수 정보를 입력해주세요.', FORM_TOAST_OPTIONS);
    }
  };

  // 유효성 검사 및 첫 번째 에러 키 반환
  const validateAndGetError = (): FormErrorKey | null => {
    // 층간 이동 방법은 필수
    if (!floorMovementMethods || floorMovementMethods.length === 0) {
      return 'floorMovementMethod';
    }

    // 엘리베이터를 선택한 경우 추가 검증
    if (floorMovementMethods.includes(FloorMovingMethodTypeDto.PlaceElevator)) {
      // 엘리베이터 사진은 필수
      if (!elevatorPhotos || elevatorPhotos.length === 0) {
        return 'elevatorPhotos';
      }

      // 계단 여부는 필수 (boolean)
      if (typeof elevatorHasStairs !== 'boolean') {
        return 'elevatorHasStairs';
      }

      // 계단이 있을 경우 계단 정보 필수
      if (elevatorHasStairs && !elevatorStairInfo) {
        return 'elevatorStairInfo';
      }

      // 계단이 1칸일 경우 높이 정보 필수
      if (
        elevatorHasStairs &&
        elevatorStairInfo === StairInfo.One &&
        !elevatorStairHeightLevel
      ) {
        return 'elevatorStairHeightLevel';
      }

      // 경사로 여부는 필수 (boolean)
      if (typeof elevatorHasSlope !== 'boolean') {
        return 'elevatorHasSlope';
      }
    }

    return null;
  };

  // 등록 버튼 핸들러
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

          <FormContainer>
            <SubSection>
              <QuestionSection>
                <SectionLabel>층간 이동 정보</SectionLabel>
                <QuestionText>
                  1층에서 다른층으로 이동가능한 방법을 모두 알려주세요
                </QuestionText>
              </QuestionSection>
              <Controller
                name="floorMovementMethod"
                rules={{required: true}}
                render={({field}) => (
                  <OptionsV2.Multiple
                    columns={1}
                    values={field.value}
                    options={makeFloorMovementOptions(
                      isStandaloneBuilding,
                      field.value ?? [],
                    )}
                    onSelect={field.onChange}
                  />
                )}
              />
            </SubSection>

            {floorMovementMethods.includes(
              FloorMovingMethodTypeDto.PlaceElevator,
            ) && (
              <>
                <SubSection>
                  <View style={{gap: 2}}>
                    <QuestionSection>
                      <SectionLabel>엘리베이터 정보</SectionLabel>
                      <QuestionText>
                        엘리베이터 사진을 찍어주세요{' '}
                        <RequiredMark>*</RequiredMark>
                      </QuestionText>
                    </QuestionSection>
                    <Hint>최대 3장까지 등록 가능해요</Hint>
                  </View>
                  <Controller
                    name="elevatorPhotos"
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
                      name="elevatorHasStairs"
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
                    {form.watch('elevatorHasStairs') && (
                      <Controller
                        name="elevatorStairInfo"
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
                </SubSection>

                {form.watch('elevatorHasStairs') &&
                  form.watch('elevatorStairInfo') === StairInfo.One && (
                    <SubSection key="stair-height">
                      <Label>
                        계단 1칸의 높이를 알려주세요{' '}
                        <RequiredMark>*</RequiredMark>
                      </Label>
                      <MeasureGuide>
                        <Image
                          source={formImages.stair}
                          style={{width: '100%', height: '100%'}}
                        />
                      </MeasureGuide>
                      <View style={{gap: 16}}>
                        <Controller
                          name="elevatorStairHeightLevel"
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
                    name="elevatorHasSlope"
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
                </SubSection>
              </>
            )}

            <SubSection>
              <Label>더 도움이 될 정보가 있다면 알려주세요</Label>
              <Controller
                name="floorMovementComment"
                render={({field}) => (
                  <TextAreaV2
                    placeholder="예시) 1층에 이용 공간이 충분해요"
                    value={field.value}
                    onChangeText={field.onChange}
                  />
                )}
              />
            </SubSection>
          </FormContainer>
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
            elementName="place_form_v2_floor_movement_prev"
            style={{flex: 1, borderRadius: 12}}
          />
          <SccButton
            text="등록하기"
            onPress={handleSubmit}
            fontFamily={font.pretendardSemibold}
            buttonColor="brandColor"
            elementName="place_form_v2_floor_movement_next"
            style={{flex: 2, borderRadius: 12}}
          />
        </SubmitButtonWrapper>
      </SafeAreaWrapper>
    </>
  );
}

const FormContainer = styled.View`
  background-color: white;
  padding-vertical: 40px;
  padding-horizontal: 20px;
  gap: 60px;
`;
