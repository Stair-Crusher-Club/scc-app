import {SccButton} from '@/components/atoms';
import {SafeAreaWrapper} from '@/components/SafeAreaWrapper';
import {Place} from '@/generated-sources/openapi';
import {Controller, useFormContext} from 'react-hook-form';
import {ScrollView, View} from 'react-native';
import FloorSelect from '../../PlaceReviewFormScreen/components/FloorSelect';
import PlaceInfoSection from '../../PlaceReviewFormScreen/sections/PlaceInfoSection';
import {FLOOR_OPTIONS, STANDALONE_BUILDING_OPTIONS} from '../constants';
import FormQuestion from './FormQuestion';
import {SectionSeparator, SubmitButtonWrapper} from './FormStyles';
import OptionsV2 from './OptionsV2';

interface FloorStepProps {
  place: Place;
  onNext: () => void;
}

export default function FloorStep({place, onNext}: FloorStepProps) {
  const form = useFormContext();

  const selectedOption = form.watch('floorOption');
  const selectedStandaloneType = form.watch('standaloneType');

  const isNextButtonDisabled =
    !selectedOption ||
    (selectedOption === 'standalone' && selectedStandaloneType === null);

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

          <View className="pt-[30px] px-[20px] pb-[40px] gap-[40px]">
            <FormQuestion
              label="층정보"
              question={
                <>
                  {place.name}
                  {'은\n건물의 1층에 있나요?'}
                </>
              }>
              <Controller
                name="floorOption"
                render={({field}) => (
                  <OptionsV2
                    value={field.value}
                    columns={1}
                    options={FLOOR_OPTIONS.map(option => ({
                      label: option.label,
                      value: option.key,
                    }))}
                    onSelect={field.onChange}
                  />
                )}
              />
            </FormQuestion>

            {selectedOption === 'otherFloor' && (
              <FormQuestion question="그럼 몇층에 있는 장소인가요?">
                <Controller
                  name="selectedFloor"
                  render={({field}) => (
                    <FloorSelect
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </FormQuestion>
            )}

            {selectedOption === 'standalone' && (
              <FormQuestion question="어떤 유형의 단독건물인가요?">
                <Controller
                  name="standaloneType"
                  render={({field}) => (
                    <OptionsV2
                      value={field.value}
                      columns={2}
                      options={STANDALONE_BUILDING_OPTIONS.map(option => ({
                        label: option.label,
                        value: option.key,
                      }))}
                      onSelect={field.onChange}
                    />
                  )}
                />
              </FormQuestion>
            )}
          </View>
        </SafeAreaWrapper>
      </ScrollView>
      <SafeAreaWrapper edges={['bottom']}>
        <SubmitButtonWrapper>
          <View className="flex-1">
            <SccButton
              text="다음"
              onPress={onNext}
              isDisabled={isNextButtonDisabled}
              buttonColor="brandColor"
              elementName="place_form_v2_next"
            />
          </View>
        </SubmitButtonWrapper>
      </SafeAreaWrapper>
    </>
  );
}
