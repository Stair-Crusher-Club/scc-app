import CloseIcon from '@/assets/icon/close.svg';
import {SccButton} from '@/components/atoms';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import BottomSheet from '@/modals/BottomSheet';
import {isEmpty} from 'lodash';
import React, {useState} from 'react';

import {Modal, ScrollView, View} from 'react-native';

import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import styled from 'styled-components/native';
import CompanySelector from './CompanySelector';
import Input from './Input';
import {ScreenLayout} from '@/components/ScreenLayout';

interface ChallengeDetailCompanyBottomSheetProps {
  isVisible: boolean;
  onPressCloseButton: () => void;
  onPressConfirmButton: (
    companyName: string,
    participantName: string,
    organizationName: string,
    employeeNumber: string,
  ) => void;
}

const ChallengeDetailCompanyModal = ({
  isVisible,
  onPressCloseButton,
  onPressConfirmButton,
}: ChallengeDetailCompanyBottomSheetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [employeeNumber, setEmployeeNumber] = useState('');

  const reset = () => {
    setCompanyName('');
    setParticipantName('');
    setOrganizationName('');
    setEmployeeNumber('');
  };

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
          <Input
            placeholder="이름을 입력해주세요"
            returnKeyType="next"
            value={participantName}
            onChangeText={setParticipantName}
            isClearable={true}
          />
          <Input
            placeholder="소속 계열사를 입력해주세요"
            returnKeyType="next"
            value={companyName}
            isClearable={true}
            onPress={() => setIsOpen(true)}
          />
          <Input
            placeholder="조직을 입력해주세요 (예: CSR팀)"
            returnKeyType="next"
            value={organizationName}
            onChangeText={setOrganizationName}
            isClearable={true}
          />
          <Input
            placeholder="사원번호를 입력해주세요"
            returnKeyType="done"
            value={employeeNumber}
            onChangeText={setEmployeeNumber}
            isClearable={true}
          />
        </ScrollView>
        <ButtonContainer>
          <ConfirmButton
            isDisabled={
              isEmpty(companyName) ||
              isEmpty(participantName) ||
              isEmpty(organizationName) ||
              isEmpty(employeeNumber)
            }
            text="확인"
            textColor="white"
            buttonColor="brandColor"
            fontFamily={font.pretendardBold}
            onPress={() => {
              onPressConfirmButton(
                companyName,
                participantName,
                organizationName,
                employeeNumber,
              );
              reset();
            }}
            elementName="challenge_company_modal_confirm"
          />
        </ButtonContainer>
      </ScreenLayout>

      <BottomSheet
        isVisible={isOpen}
        onPressBackground={() => setIsOpen(false)}>
        <CompanySelector
          value={companyName}
          onChange={setCompanyName}
          onClose={() => setIsOpen(false)}
        />
      </BottomSheet>
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
