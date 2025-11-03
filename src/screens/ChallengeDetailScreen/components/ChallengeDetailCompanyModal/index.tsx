import CloseIcon from '@/assets/icon/close.svg';
import {SccButton} from '@/components/atoms';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import React, {useState, useEffect, useCallback, useMemo} from 'react';

import {Modal, ScrollView, View} from 'react-native';

import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import styled from 'styled-components/native';
import {ScreenLayout} from '@/components/ScreenLayout';
import type {
  ChallengeB2bFormSchemaDto,
  JoinChallengeRequestCompanyJoinInfoDto,
} from '@/generated-sources/openapi/api';
import FormFieldRenderer from '@/components/molecules/FormFieldRenderer';
import {
  toFormField,
  validateForm,
  transformToApiRequest,
  type FormField,
  type FormState,
} from '@/types/b2bForm';

interface ChallengeDetailCompanyBottomSheetProps {
  isVisible: boolean;
  onPressCloseButton: () => void;
  onPressConfirmButton: (
    companyInfo: JoinChallengeRequestCompanyJoinInfoDto,
  ) => void;
  formSchema?: ChallengeB2bFormSchemaDto;
}

const ChallengeDetailCompanyModal = ({
  isVisible,
  onPressCloseButton,
  onPressConfirmButton,
  formSchema,
}: ChallengeDetailCompanyBottomSheetProps) => {
  const [formState, setFormState] = useState<FormState>({});
  const [fields, setFields] = useState<FormField[]>([]);

  // Convert API DTO to FormField array
  useEffect(() => {
    if (formSchema?.availableFields) {
      const convertedFields = formSchema.availableFields.map(dto =>
        toFormField(dto),
      );
      setFields(convertedFields);
    }
  }, [formSchema]);

  // Reset form state
  const reset = useCallback(() => {
    setFormState({});
  }, []);

  // Update field value
  const handleFieldChange = useCallback((key: string, value: string) => {
    setFormState(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Get field value
  const getFieldValue = useCallback(
    (key: string) => {
      return formState[key] || '';
    },
    [formState],
  );

  // Validate form
  const isFormValid = useMemo(() => {
    const validation = validateForm(formState, fields);
    return validation.isValid;
  }, [formState, fields]);

  return (
    <Modal visible={isVisible} statusBarTranslucent>
      <ScreenLayout
        isHeaderVisible={false}
        safeAreaEdges={['top', 'bottom']}
        style={{flex: 1}}>
        <SccTouchableOpacity
          elementName="challenge_modal_close_button"
          onPress={() => {
            onPressCloseButton();
            reset();
          }}
          style={{
            alignItems: 'flex-end',
            paddingHorizontal: 20,
            paddingVertical: 13,
          }}>
          <CloseIcon width={24} height={24} color={color.gray90} />
        </SccTouchableOpacity>
        <ScrollView
          bounces={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 20,
            gap: 36,
          }}>
          <View>
            <Title>챌린지 참여를 환영합니다!</Title>
            <Description>서비스 사용에 필요한 정보를 알려주세요.</Description>
          </View>
          {fields.map(field => (
            <FormFieldRenderer
              key={field.key}
              field={field}
              value={getFieldValue(field.key)}
              onChange={value => handleFieldChange(field.key, value)}
              elementNamePrefix="b2b-form"
            />
          ))}
        </ScrollView>
        <ButtonContainer>
          <ConfirmButton
            isDisabled={!isFormValid}
            text="확인"
            textColor="white"
            buttonColor="brandColor"
            fontFamily={font.pretendardBold}
            onPress={() => {
              const companyInfo = transformToApiRequest(formState, fields);
              onPressConfirmButton(companyInfo);
              reset();
            }}
            elementName="challenge_company_modal_confirm"
          />
        </ButtonContainer>
      </ScreenLayout>
    </Modal>
  );
};

export default ChallengeDetailCompanyModal;

export const Title = styled.Text({
  color: color.black,
  fontSize: 24,
  fontFamily: font.pretendardBold,
});

export const Description = styled.Text({
  color: color.black,
  fontSize: 16,
  fontFamily: font.pretendardRegular,
  marginTop: 8,
});

export const InputWrapper = styled.View({
  paddingHorizontal: 24,
  gap: 8,
  marginTop: 30,
});

export const InputLabel = styled.Text({
  fontFamily: font.pretendardMedium,
  fontSize: 13,
});

export const ButtonContainer = styled.View({
  flexDirection: 'row',
  gap: 10,
  paddingVertical: 20,
  paddingHorizontal: 20,
});

export const CloseButton = styled(SccButton)`
  flex: 1;
`;

export const ConfirmButton = styled(SccButton)`
  flex: 1;
`;

export const Overlay = styled.View({
  position: 'absolute',
  inset: 0,
  backgroundColor: color.blacka50,
  zIndex: 9999,
});
