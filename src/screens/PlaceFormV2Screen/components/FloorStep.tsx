import {SccButton} from '@/components/atoms';
import {SafeAreaWrapper} from '@/components/SafeAreaWrapper';
import {font} from '@/constant/font';
import {Place} from '@/generated-sources/openapi';
import ToastUtils from '@/utils/ToastUtils';
import {Controller, useFormContext} from 'react-hook-form';
import {ScrollView, View} from 'react-native';
import styled from 'styled-components/native';
import FloorSelect from '../../PlaceReviewFormScreen/components/FloorSelect';
import PlaceInfoSection from '../../PlaceReviewFormScreen/sections/PlaceInfoSection';
import {
  FLOOR_OPTIONS,
  FORM_TOAST_OPTIONS,
  STANDALONE_BUILDING_OPTIONS,
} from '../constants';
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

  const selectedOption = form.watch('floorOption');
  const selectedStandaloneType = form.watch('standaloneType');

  type FormErrorKey = 'floorOption' | 'standaloneType';

  const noticeError = (errorKey: FormErrorKey) => {
    switch (errorKey) {
      case 'floorOption':
        ToastUtils.show('층 정보를 선택해주세요.', FORM_TOAST_OPTIONS);
        break;
      case 'standaloneType':
        ToastUtils.show('단독건물 유형을 선택해주세요.', FORM_TOAST_OPTIONS);
        break;
      default:
        ToastUtils.show('필수 정보를 입력해주세요.', FORM_TOAST_OPTIONS);
    }
  };

  // 유효성 검사 및 첫 번째 에러 키 반환
  const validateAndGetError = (): FormErrorKey | null => {
    if (!selectedOption) {
      return 'floorOption';
    }
    if (selectedOption === 'standalone' && selectedStandaloneType === null) {
      return 'standaloneType';
    }
    return null;
  };

  // 다음 버튼 핸들러
  const handleNext = () => {
    const errorKey = validateAndGetError();
    if (errorKey) {
      noticeError(errorKey);
      return;
    }
    onNext();
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
      <SafeAreaWrapper edges={['bottom']}>
        <SubmitButtonWrapper>
          <ButtonContainer>
            <SccButton
              text="다음"
              onPress={handleNext}
              buttonColor="brandColor"
              elementName="place_form_v2_next"
              fontFamily={font.pretendardSemibold}
              style={{borderRadius: 12}}
            />
          </ButtonContainer>
        </SubmitButtonWrapper>
      </SafeAreaWrapper>
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

const ButtonContainer = styled.View`
  flex: 1;
`;
