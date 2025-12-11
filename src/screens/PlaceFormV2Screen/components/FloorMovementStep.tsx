import {SccButton} from '@/components/atoms';
import {SafeAreaWrapper} from '@/components/SafeAreaWrapper';
import {MAX_NUMBER_OF_TAKEN_PHOTOS} from '@/constant/constant';
import {
  FloorMovingMethodTypeDto,
  Place,
  StairHeightLevel,
  StairInfo,
} from '@/generated-sources/openapi';
import {useKeyboardVisible} from '@/hooks/useKeyboardVisible';
import {Controller, useFormContext} from 'react-hook-form';
import {ScrollView, View} from 'react-native';
import PlaceInfoSection from '../../PlaceReviewFormScreen/sections/PlaceInfoSection';
import {formImages, makeFloorMovementOptions} from '../constants';
import FormQuestion from './FormQuestion';
import {SectionSeparator, SubmitButtonWrapper} from './FormStyles';
import MeasureGuide from './MeasureGuide';
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
  const floorMovementMethod = form.watch('floorMovementMethod');
  const elevatorPhotos = form.watch('elevatorPhotos');
  const elevatorHasStairs = form.watch('elevatorHasStairs');
  const elevatorStairInfo = form.watch('elevatorStairInfo');
  const elevatorStairHeightLevel = form.watch('elevatorStairHeightLevel');
  const elevatorHasSlope = form.watch('elevatorHasSlope');

  // Check if all required fields are filled
  const isFormValid = (() => {
    // 층간 이동 방법은 필수
    if (!floorMovementMethod) {
      return false;
    }

    // 엘리베이터를 선택한 경우 추가 검증
    if (floorMovementMethod === FloorMovingMethodTypeDto.PlaceElevator) {
      // 엘리베이터 사진은 필수
      if (!elevatorPhotos || elevatorPhotos.length === 0) {
        return false;
      }

      // 계단 여부는 필수 (boolean)
      if (typeof elevatorHasStairs !== 'boolean') {
        return false;
      }

      // 계단이 있을 경우 계단 정보 필수
      if (elevatorHasStairs && !elevatorStairInfo) {
        return false;
      }

      // 계단이 1칸일 경우 높이 정보 필수
      if (
        elevatorHasStairs &&
        elevatorStairInfo === StairInfo.One &&
        !elevatorStairHeightLevel
      ) {
        return false;
      }

      // 경사로 여부는 필수 (boolean)
      if (typeof elevatorHasSlope !== 'boolean') {
        return false;
      }
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
            <FormQuestion
              label="층간 이동 정보"
              question="1층에서 다른층으로 이동가능한 방법을 모두 알려주세요">
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
            </FormQuestion>

            {form.watch('floorMovementMethod') ===
              FloorMovingMethodTypeDto.PlaceElevator && (
              <>
                <FormQuestion
                  label="엘리베이터 정보"
                  question="엘리베이터 사진을 찍어주세요">
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
                </FormQuestion>

                <FormQuestion question="입구에 계단이 있나요?">
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
                </FormQuestion>

                {form.watch('elevatorHasStairs') &&
                  form.watch('elevatorStairInfo') === StairInfo.One && (
                    <FormQuestion
                      key="stair-height"
                      question="계단 1칸의 높이를 알려주세요">
                      <MeasureGuide source={formImages.stair} />
                      <View className="gap-[16px]">
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
                    </FormQuestion>
                  )}

                <FormQuestion question="입구에 경사로가 있나요?">
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
                </FormQuestion>
              </>
            )}

            <FormQuestion question="더 도움이 될 정보가 있다면 알려주세요">
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
            elementName="place_form_v2_floor_movement_prev"
            style={{flex: 1}}
          />
          <SccButton
            text="등록하기"
            onPress={onSubmit}
            buttonColor="brandColor"
            fontWeight="600"
            elementName="place_form_v2_floor_movement_next"
            style={{flex: 2}}
            isDisabled={!isFormValid}
          />
        </SubmitButtonWrapper>
      </SafeAreaWrapper>
    </>
  );
}
