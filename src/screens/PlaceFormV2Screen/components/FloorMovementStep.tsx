import {SafeAreaWrapper} from '@/components/SafeAreaWrapper';
import {SccButton} from '@/components/atoms';
import {color} from '@/constant/color';
import {MAX_NUMBER_OF_TAKEN_PHOTOS} from '@/constant/constant';
import {font} from '@/constant/font';
import {
  FloorMovingMethodTypeDto,
  Place,
  StairHeightLevel,
  StairInfo,
} from '@/generated-sources/openapi';
import {MeasureGuide} from '@/screens/BuildingFormScreen/sections/ElevatorSection.style';
import {Controller, useFormContext} from 'react-hook-form';
import {Image, ScrollView, View} from 'react-native';
import styled from 'styled-components/native';
import PlaceInfoSection from '../../PlaceReviewFormScreen/sections/PlaceInfoSection';
import {SectionSeparator} from '../PlaceFormV2Screen';
import OptionsV2 from './OptionsV2';
import PhotosV2 from './PhotosV2';
import TextAreaV2 from './TextAreaV2';

interface FloorMovementStepProps {
  place: Place;
  isStandaloneBuilding: boolean;
  onSubmit: () => void;
  onBack: () => void;
}

const makeFloorMovementOptions = (isStandaloneBuilding: boolean) => {
  if (isStandaloneBuilding) {
    return [
      {label: '엘리베이터', value: FloorMovingMethodTypeDto.PlaceElevator},
      {label: '계단', value: FloorMovingMethodTypeDto.PlaceStairs},
      {label: '에스컬레이터', value: FloorMovingMethodTypeDto.PlaceEscalator},
      {label: '모르겠음', value: FloorMovingMethodTypeDto.Unknown},
    ];
  }

  return [
    {
      label: '매장 내부 엘리베이터',
      value: FloorMovingMethodTypeDto.PlaceElevator,
    },
    {label: '매장 내부 계단', value: FloorMovingMethodTypeDto.PlaceStairs},
    {
      label: '매장 내부 에스컬레이터',
      value: FloorMovingMethodTypeDto.PlaceEscalator,
    },
    {
      label: '매장 외부 엘리베이터',
      value: FloorMovingMethodTypeDto.BuildingElevator,
    },
    {label: '매장 외부 계단', value: FloorMovingMethodTypeDto.BuildingStairs},
    {
      label: '매장 외부 에스컬레이터',
      value: FloorMovingMethodTypeDto.BuildingEscalator,
    },
    {label: '모르겠음', value: FloorMovingMethodTypeDto.Unknown},
  ];
};

export default function FloorMovementStep({
  place,
  isStandaloneBuilding,
  onSubmit,
  onBack,
}: FloorMovementStepProps) {
  const form = useFormContext();

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
                <QuestionTextStyled>
                  1층에서 다른층으로 이동가능한 방법을 모두 알려주세요
                </QuestionTextStyled>
              </QuestionSection>
              <Controller
                name="floorMovementMethod"
                rules={{required: true}}
                render={({field}) => (
                  <OptionsV2
                    columns={1}
                    value={field.value}
                    options={makeFloorMovementOptions(isStandaloneBuilding)}
                    onSelect={field.onChange}
                  />
                )}
              />
            </SubSection>

            {isStandaloneBuilding &&
              form.watch('floorMovementMethod') ===
                FloorMovingMethodTypeDto.PlaceElevator && (
                <>
                  <SubSection>
                    <QuestionSection>
                      <SectionLabel>엘리베이터 정보</SectionLabel>
                      <QuestionTextStyled>
                        엘리베이터 사진을 찍어주세요
                      </QuestionTextStyled>
                    </QuestionSection>
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
                    <Label>입구에 계단이 있나요?</Label>
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
                  </SubSection>

                  {form.watch('elevatorHasStairs') &&
                    form.watch('elevatorStairInfo') === StairInfo.One && (
                      <SubSection key="stair-height">
                        <Label>계단 1칸의 높이를 알려주세요</Label>
                        <MeasureGuide>
                          <Image
                            source={require('@/assets/img/stair_thumb.jpg')}
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
                    <Label>입구에 경사로가 있나요?</Label>
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
                    placeholder="예시: 엘리베이터는 건물 뒤쪽에 있어요"
                    value={field.value}
                    onChangeText={field.onChange}
                  />
                )}
              />
            </SubSection>
          </FormContainer>
        </SafeAreaWrapper>
      </ScrollView>
      <SubmitButtonWrapper>
        <SccButton
          text="이전"
          onPress={onBack}
          buttonColor="gray10"
          textColor="black"
          fontFamily={font.pretendardMedium}
          elementName="place_form_v2_floor_movement_prev"
          style={{flex: 1}}
        />
        <SccButton
          text="등록하기"
          onPress={onSubmit}
          fontFamily={font.pretendardMedium}
          buttonColor="brandColor"
          elementName="place_form_v2_floor_movement_next"
          style={{flex: 2}}
        />
      </SubmitButtonWrapper>
    </>
  );
}

const FormContainer = styled.View`
  background-color: white;
  padding-vertical: 40px;
  padding-horizontal: 20px;
  gap: 48px;
`;

const SectionLabel = styled.Text`
  font-size: 14px;
  line-height: 20px;
  font-family: ${font.pretendardBold};
  color: ${color.brand50};
`;

const QuestionTextStyled = styled.Text`
  font-size: 22px;
  line-height: 30px;
  font-family: ${font.pretendardSemibold};
  color: ${color.gray80};
`;

const QuestionSection = styled.View`
  gap: 8px;
`;

const SubSection = styled.View`
  gap: 20px;
`;

const Label = styled.Text`
  font-size: 22px;
  line-height: 30px;
  font-family: ${font.pretendardSemibold};
  color: ${color.gray80};
`;

const SubmitButtonWrapper = styled.View`
  background-color: ${color.white};
  padding-vertical: 12px;
  padding-horizontal: 20px;
  border-top-width: 1px;
  border-top-color: ${color.gray15};
  flex-direction: row;
  gap: 12px;
`;
