import {SafeAreaWrapper} from '@/components/SafeAreaWrapper';
import {SccButton} from '@/components/atoms';
import {color} from '@/constant/color';
import {MAX_NUMBER_OF_TAKEN_PHOTOS} from '@/constant/constant';
import {font} from '@/constant/font';
import {makeDoorTypeOptions} from '@/constant/options';
import {
  EntranceDoorType,
  Place,
  StairHeightLevel,
  StairInfo,
} from '@/generated-sources/openapi';
import ImageFile from '@/models/ImageFile';
import {MeasureGuide} from '@/screens/BuildingFormScreen/sections/ElevatorSection.style';
import {Controller, FormProvider, useForm} from 'react-hook-form';
import {Image, ScrollView, View} from 'react-native';
import styled from 'styled-components/native';
import PlaceInfoSection from '../../PlaceReviewFormScreen/sections/PlaceInfoSection';
import {SectionSeparator} from '../PlaceFormV2Screen';
import OptionsV2 from './OptionsV2';
import PhotosV2 from './PhotosV2';
import TextAreaV2 from './TextAreaV2';

type BuildingDoorDirectionType = 'inside' | 'outside';

interface FormValues {
  doorDirection: BuildingDoorDirectionType;
  enterancePhotos: ImageFile[];
  hasStairs: boolean;
  stairInfo: StairInfo;
  hasSlope: boolean;
  doorType: EntranceDoorType[];
  additionalInfo: string[];
  comment: string | undefined;
}

interface InfoStepProps {
  place: Place;
  isStandaloneBuilding: boolean;
  hasFloorMovementStep: boolean;
  onSubmit: (doorDirection?: BuildingDoorDirectionType) => void;
  onBack: () => void;
}

export default function InfoStep({
  place,
  isStandaloneBuilding,
  hasFloorMovementStep,
  onSubmit,
  onBack,
}: InfoStepProps) {
  const form = useForm<FormValues>();

  const handleSubmit = () => {
    const doorDirection = form.getValues('doorDirection');
    onSubmit(doorDirection);
  };

  return (
    <FormProvider {...form}>
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
                  <QuestionTextStyled>
                    매장의 출입구가 어디쪽에 있나요?
                  </QuestionTextStyled>
                </QuestionSection>
                <Controller
                  name="doorDirection"
                  rules={{required: true}}
                  render={({field}) => (
                    <DoorDirectionContainer>
                      <DoorDirectionOption>
                        <DoorDirectionImageContainer>
                          <Image
                            source={require('@/assets/img/img_enterance_example_out.png')}
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
                      <DoorDirectionOption>
                        <DoorDirectionImageContainer>
                          <Image
                            source={require('@/assets/img/img_enterance_example_in.png')}
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
              <Label>출입구 사진을 등록해주세요</Label>
              <Controller
                name="enterancePhotos"
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
            </SubSection>

            {form.watch('hasStairs') &&
              form.watch('stairInfo') === StairInfo.One && (
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
              <Label>입구에 경사로가 있나요?</Label>
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
            </SubSection>

            <SubSection>
              <Label>출입문은 어떤 종류인가요?</Label>
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
              <Label>추가로 알려주실 내용이 있으신가요?</Label>
              <Controller
                name="additionalInfo"
                render={({field}) => (
                  <OptionsV2.Multiple
                    values={field.value ?? []}
                    size="sm"
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
                    placeholder="예시: 입구가 골목 안쪽이에요"
                    value={field.value}
                    onChangeText={field.onChange}
                  />
                )}
              />
            </SubSection>
          </InfoFormContainer>
        </SafeAreaWrapper>
      </ScrollView>
      <SubmitButtonWrapper>
        <SccButton
          text="이전"
          onPress={onBack}
          buttonColor="gray10"
          textColor="black"
          fontFamily={font.pretendardMedium}
          elementName="place_form_v2_info_prev"
          style={{flex: 1}}
        />
        <SccButton
          text={hasFloorMovementStep ? '다음' : '등록하기'}
          onPress={handleSubmit}
          fontFamily={font.pretendardMedium}
          buttonColor="brandColor"
          elementName={
            hasFloorMovementStep
              ? 'place_form_v2_info_next'
              : 'place_form_v2_submit'
          }
          style={{flex: 2}}
        />
      </SubmitButtonWrapper>
    </FormProvider>
  );
}

const InfoFormContainer = styled.View`
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

const DoorDirectionContainer = styled.View`
  flex-direction: row;
  gap: 12px;
`;

const DoorDirectionOption = styled.View`
  flex: 1;
  gap: 12px;
`;

const DoorDirectionImageContainer = styled.View`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
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
