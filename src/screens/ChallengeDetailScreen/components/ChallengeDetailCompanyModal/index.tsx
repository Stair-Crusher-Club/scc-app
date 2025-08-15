import CloseIcon from '@/assets/icon/close.svg';
import {SccButton} from '@/components/atoms';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import BottomSheet from '@/modals/BottomSheet';
import {isEmpty} from 'lodash';
import React, {useState} from 'react';
import {
  Modal,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import CompanySelector from './CompanySelector';
import Input from './Input';

interface ChallengeDetailCompanyBottomSheetProps {
  isVisible: boolean;
  onPressCloseButton: () => void;
  onPressConfirmButton: (companyName: string, participantName: string) => void;
}

const ChallengeDetailCompanyModal = ({
  isVisible,
  onPressCloseButton,
  onPressConfirmButton,
}: ChallengeDetailCompanyBottomSheetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [participantName, setParticipantName] = useState('');

  const reset = () => {
    setCompanyName('');
    setParticipantName('');
  };

  const insets = useSafeAreaInsets();

  return (
    <Modal visible={isVisible} statusBarTranslucent>
      <View
        style={{
          flex: 1,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}>
        <TouchableOpacity
          onPress={onPressCloseButton}
          style={{
            alignItems: 'flex-end',
            paddingHorizontal: 20,
            paddingVertical: 13,
          }}>
          <CloseIcon width={24} height={24} color={color.gray90} />
        </TouchableOpacity>
        <ScrollView
          bounces={false}
          contentContainerStyle={{
            flex: 1,
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
        </ScrollView>
        <ButtonContainer>
          <ConfirmButton
            isDisabled={isEmpty(companyName) || isEmpty(participantName)}
            text="확인"
            textColor="white"
            buttonColor="brandColor"
            fontFamily={font.pretendardBold}
            onPress={() => {
              onPressConfirmButton(companyName, participantName);
              reset();
            }}
          />
        </ButtonContainer>
      </View>

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

export const CompanyNameInput = styled.TextInput({
  height: 56,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: color.brand20,
  color: color.black,
  paddingHorizontal: 25,
  fontSize: 18,
  // 안드로이드 대응
  ...Platform.select({
    android: {
      borderBottomWidth: 1,
      borderBottomColor: color.brand20,
    },
  }),
});

export const ParticipantName = styled.TextInput({
  height: 56,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: color.brand20,
  color: color.black,
  paddingHorizontal: 25,
  fontSize: 18,
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
