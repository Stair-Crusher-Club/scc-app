import {isEmpty} from 'lodash';
import React, {useState} from 'react';
import styled from 'styled-components/native';

import {SccButton} from '@/components/atoms';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import BottomSheet from '@/modals/BottomSheet';

interface ChallengeDetailPasscodeBottomSheetProps {
  isVisible: boolean;
  onPressCloseButton: () => void;
  onPressConfirmButton: (passcode: string) => void;
}

const ChallengeDetailPasscodeBottomSheet = ({
  isVisible,
  onPressCloseButton,
  onPressConfirmButton,
}: ChallengeDetailPasscodeBottomSheetProps) => {
  const [passcode, setPasscode] = useState('');

  return (
    <BottomSheet isVisible={isVisible}>
      <Title>참여 코드를 입력해 주세요</Title>
      <PasscodeInput
        placeholder="참여 코드"
        value={passcode}
        onChangeText={text => {
          setPasscode(text);
        }}
      />
      <ButtonContainer>
        <CloseButton
          text={'닫기'}
          textColor="black"
          buttonColor="gray10"
          fontFamily={font.pretendardMedium}
          onPress={() => {
            onPressCloseButton();
            setPasscode('');
          }}
          elementName="challenge_passcode_close"
        />
        <ConfirmButton
          isDisabled={isEmpty(passcode)}
          text={'코드 입력'}
          textColor="white"
          buttonColor="brandColor"
          fontFamily={font.pretendardBold}
          onPress={() => {
            onPressConfirmButton(passcode);
            setPasscode('');
          }}
          elementName="challenge_passcode_confirm"
        />
      </ButtonContainer>
    </BottomSheet>
  );
};

export default ChallengeDetailPasscodeBottomSheet;

export const Title = styled.Text({
  color: color.black,
  fontSize: 20,
  fontFamily: font.pretendardBold,
  marginTop: 28,
  marginHorizontal: 24,
});

export const PasscodeInput = styled.TextInput({
  height: 56,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: color.brand20,
  color: color.black,
  marginTop: 30,
  marginHorizontal: 24,
  paddingHorizontal: 25,
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
