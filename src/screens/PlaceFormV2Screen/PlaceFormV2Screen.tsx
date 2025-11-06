import {SafeAreaWrapper} from '@/components/SafeAreaWrapper';
import {SccPressable} from '@/components/SccPressable';
import {ScreenLayout} from '@/components/ScreenLayout';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {Building, Place} from '@/generated-sources/openapi';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import {ScreenProps} from '@/navigation/Navigation.screens';
import {ReactNode, useState} from 'react';
import {ScrollView, View} from 'react-native';
import styled from 'styled-components/native';
import PlaceInfoSection from '../PlaceReviewFormScreen/sections/PlaceInfoSection';

export interface PlaceFormV2ScreenParams {
  place: Place;
  building: Building;
}

type FloorOptionKey =
  | 'firstFloor'
  | 'otherFloor'
  | 'multipleFloors'
  | 'standalone';

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

interface QuestionTextProps {
  children: ReactNode;
}

export function QuestionText({children}: QuestionTextProps) {
  return <QuestionTextStyled>{children}</QuestionTextStyled>;
}

export default function PlaceFormV2Screen({route}: ScreenProps<'PlaceFormV2'>) {
  const {place} = route.params;
  const [selectedOption, setSelectedOption] = useState<FloorOptionKey | null>(
    null,
  );

  return (
    <LogParamsProvider params={{place_id: place.id}}>
      <ScreenLayout isHeaderVisible={true}>
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
                <HeaderSection>
                  <SectionLabel>층정보</SectionLabel>
                  <QuestionText>
                    {place.name}
                    {'은\n건물의 1층에 있나요?'}
                  </QuestionText>
                </HeaderSection>

                <OptionsContainer>
                  {FLOOR_OPTIONS.map(option => {
                    const isSelected = selectedOption === option.key;
                    return (
                      <SccPressable
                        key={option.key}
                        elementName={`floor_option_${option.key}`}
                        onPress={() => setSelectedOption(option.key)}>
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
                  {/* 층 정보 입력 */}
                </AdditionalQuestionArea>
              )}

              {selectedOption === 'standalone' && (
                <AdditionalQuestionArea>
                  <QuestionTextStyled>
                    어떤 유형의 단독건물인가요?
                  </QuestionTextStyled>
                  {/* 단독 건물 타입 입력 */}
                </AdditionalQuestionArea>
              )}
            </Container>
          </SafeAreaWrapper>
        </ScrollView>
      </ScreenLayout>
    </LogParamsProvider>
  );
}

export const SectionSeparator = styled.View({
  backgroundColor: color.gray10,
  height: 6,
});

const Container = styled.View`
  padding-top: 30px;
  padding-horizontal: 20px;
  padding-bottom: 40px;
  gap: 40px;
`;

const HeaderSection = styled.View`
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

const AdditionalQuestionArea = styled.View``;
