import {SafeAreaWrapper} from '@/components/SafeAreaWrapper';
import {SccButton} from '@/components/atoms';
import {Place} from '@/generated-sources/openapi';
import {Controller, useFormContext} from 'react-hook-form';
import {ScrollView, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import FloorSelect from '../../PlaceReviewFormScreen/components/FloorSelect';
import PlaceInfoSection from '../../PlaceReviewFormScreen/sections/PlaceInfoSection';
import {FLOOR_OPTIONS, STANDALONE_BUILDING_OPTIONS} from '../constants';
import {
  QuestionSection,
  QuestionText,
  SectionLabel,
  SectionSeparator,
  SubmitButtonWrapper,
} from '../PlaceFormV2Screen';
import OptionsV2 from './OptionsV2';

interface FloorStepProps {
  place: Place;
  onNext: () => void;
}

export default function FloorStep({place, onNext}: FloorStepProps) {
  const form = useFormContext();
  const insets = useSafeAreaInsets();

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

          <Container>
            <View style={{gap: 20}}>
              <QuestionSection>
                <SectionLabel>층정보</SectionLabel>
                <QuestionText>
                  {place.name}
                  {'은\n건물의 1층에 있나요?'}
                </QuestionText>
              </QuestionSection>

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
            </View>

            {selectedOption === 'otherFloor' && (
              <AdditionalQuestionArea>
                <QuestionText>그럼 몇층에 있는 장소인가요?</QuestionText>
                <Controller
                  name="selectedFloor"
                  render={({field}) => (
                    <FloorSelect
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </AdditionalQuestionArea>
            )}

            {selectedOption === 'standalone' && (
              <AdditionalQuestionArea>
                <QuestionText>어떤 유형의 단독건물인가요?</QuestionText>
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
              </AdditionalQuestionArea>
            )}
          </Container>
        </SafeAreaWrapper>
      </ScrollView>
      <SubmitButtonWrapper style={{paddingBottom: 12 + insets.bottom}}>
        <SccButton
          text="다음"
          onPress={onNext}
          isDisabled={isNextButtonDisabled}
          buttonColor="brandColor"
          elementName="place_form_v2_next"
        />
      </SubmitButtonWrapper>
    </>
  );
}

const Container = styled.View`
  padding-top: 30px;
  padding-horizontal: 20px;
  padding-bottom: 40px;
  gap: 40px;
`;

const AdditionalQuestionArea = styled.View`
  gap: 20px;
`;
