import {SafeAreaWrapper} from '@/components/SafeAreaWrapper';
import {SccPressable} from '@/components/SccPressable';
import {SccButton} from '@/components/atoms';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {Place} from '@/generated-sources/openapi';
import {ReactNode} from 'react';
import {ScrollView, View} from 'react-native';
import styled from 'styled-components/native';
import FloorSelect from '../../PlaceReviewFormScreen/components/FloorSelect';
import PlaceInfoSection from '../../PlaceReviewFormScreen/sections/PlaceInfoSection';
import {SectionSeparator} from '../PlaceFormV2Screen';

interface QuestionTextProps {
  children: ReactNode;
}

function QuestionText({children}: QuestionTextProps) {
  return <QuestionTextStyled>{children}</QuestionTextStyled>;
}

type FloorOptionKey =
  | 'firstFloor'
  | 'otherFloor'
  | 'multipleFloors'
  | 'standalone';

type StandaloneBuildingType = 'singleFloor' | 'multipleFloors';

interface FloorOption {
  key: FloorOptionKey;
  label: string;
}

const FLOOR_OPTIONS: FloorOption[] = [
  {key: 'firstFloor', label: '네, 1층에 있어요'},
  {key: 'otherFloor', label: '아니요, 다른층이에요'},
  {key: 'multipleFloors', label: '1층을 포함한 여러층이에요'},
  {key: 'standalone', label: '단독건물이에요'},
];

interface StandaloneBuildingOption {
  key: StandaloneBuildingType;
  label: string;
}

const STANDALONE_BUILDING_OPTIONS: StandaloneBuildingOption[] = [
  {key: 'singleFloor', label: '단독 1층 건물이에요'},
  {key: 'multipleFloors', label: '여러층 건물이에요'},
];

interface FloorStepProps {
  place: Place;
  selectedOption: FloorOptionKey | null;
  selectedStandaloneType: StandaloneBuildingType | null;
  selectedFloor: number | undefined;
  onOptionChange: (option: FloorOptionKey) => void;
  onStandaloneTypeChange: (type: StandaloneBuildingType) => void;
  onFloorChange: (floor: number | undefined) => void;
  onNext: () => void;
}

export default function FloorStep({
  place,
  selectedOption,
  selectedStandaloneType,
  selectedFloor,
  onOptionChange,
  onStandaloneTypeChange,
  onFloorChange,
  onNext,
}: FloorStepProps) {
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

              <OptionsContainer>
                {FLOOR_OPTIONS.map(option => {
                  const isSelected = selectedOption === option.key;
                  return (
                    <SccPressable
                      key={option.key}
                      elementName={`floor_option_${option.key}`}
                      onPress={() => onOptionChange(option.key)}>
                      <OptionButton isSelected={isSelected}>
                        <OptionText isSelected={isSelected}>
                          {option.label}
                        </OptionText>
                      </OptionButton>
                    </SccPressable>
                  );
                })}
              </OptionsContainer>
            </View>

            {selectedOption === 'otherFloor' && (
              <AdditionalQuestionArea>
                <QuestionTextStyled>
                  그럼 몇층에 있는 장소인가요?
                </QuestionTextStyled>
                <FloorSelect value={selectedFloor} onChange={onFloorChange} />
              </AdditionalQuestionArea>
            )}

            {selectedOption === 'standalone' && (
              <AdditionalQuestionArea>
                <QuestionTextStyled>
                  어떤 유형의 단독건물인가요?
                </QuestionTextStyled>
                <RowOptionsContainer>
                  {STANDALONE_BUILDING_OPTIONS.map(option => {
                    const isSelected = selectedStandaloneType === option.key;
                    return (
                      <SccPressable
                        key={option.key}
                        elementName={`standalone_building_${option.key}`}
                        onPress={() => onStandaloneTypeChange(option.key)}
                        style={{flex: 1}}>
                        <OptionButton isSelected={isSelected}>
                          <OptionText isSelected={isSelected}>
                            {option.label}
                          </OptionText>
                        </OptionButton>
                      </SccPressable>
                    );
                  })}
                </RowOptionsContainer>
              </AdditionalQuestionArea>
            )}
          </Container>
        </SafeAreaWrapper>
      </ScrollView>
      <SubmitButtonWrapper>
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

const QuestionSection = styled.View`
  gap: 8px;
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

const OptionsContainer = styled.View`
  gap: 12px;
  margin-top: 12px;
`;

const RowOptionsContainer = styled.View`
  flex-direction: row;
  gap: 12px;
`;

const OptionButton = styled.View<{isSelected: boolean}>`
  border-width: 1.2px;
  border-color: ${props => (props.isSelected ? color.blue40 : color.gray20)};
  background-color: ${props => (props.isSelected ? color.brand5 : color.white)};
  padding-horizontal: 14px;
  padding-vertical: 12px;
  border-radius: 14px;
  align-items: center;
  justify-content: center;
`;

const OptionText = styled.Text<{isSelected: boolean}>`
  font-size: 16px;
  line-height: 24px;
  font-family: ${font.pretendardMedium};
  color: ${props => (props.isSelected ? color.brand50 : color.gray80)};
`;

const AdditionalQuestionArea = styled.View`
  gap: 20px;
`;

const SubmitButtonWrapper = styled.View`
  background-color: ${color.white};
  padding-vertical: 12px;
  padding-horizontal: 20px;
  border-top-width: 1px;
  border-top-color: ${color.gray15};
`;
