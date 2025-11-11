import {SafeAreaWrapper} from '@/components/SafeAreaWrapper';
import {SccButton} from '@/components/atoms';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {Place} from '@/generated-sources/openapi';
import {FormProvider, useForm} from 'react-hook-form';
import {ScrollView} from 'react-native';
import styled from 'styled-components/native';
import PlaceInfoSection from '../../PlaceReviewFormScreen/sections/PlaceInfoSection';
import {SectionSeparator} from '../PlaceFormV2Screen';

interface FormValues {
  // TODO: 폼 필드 추가 예정
}

interface FloorMovementStepProps {
  place: Place;
  onSubmit: () => void;
  onBack: () => void;
}

export default function FloorMovementStep({
  place,
  onSubmit,
  onBack,
}: FloorMovementStepProps) {
  const form = useForm<FormValues>();

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

          <FormContainer>{/* TODO: 폼 내용 추가 예정 */}</FormContainer>
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
    </FormProvider>
  );
}

const FormContainer = styled.View`
  background-color: white;
  padding-vertical: 40px;
  padding-horizontal: 20px;
  gap: 48px;
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
