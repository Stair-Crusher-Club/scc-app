import ArrowDownIcon from '@/assets/icon/ic_arrow_down.svg';
import {SccButton} from '@/components/atoms';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import BottomSheet from '@/modals/BottomSheet';
import {isEmpty} from 'lodash';
import React, {useState} from 'react';
import {Platform, TouchableOpacity, View} from 'react-native';
import styled from 'styled-components/native';

interface ChallengeDetailCompanyBottomSheetProps {
  isVisible: boolean;
  onPressCloseButton: () => void;
  onPressConfirmButton: (affiliate: string, username: string) => void;
}

const ChallengeDetailCompanyBottomSheet = ({
  isVisible,
  onPressCloseButton,
  onPressConfirmButton,
}: ChallengeDetailCompanyBottomSheetProps) => {
  const [affiliate, setAffiliate] = useState('');
  const [username, setUsername] = useState('');

  const reset = () => {
    setAffiliate('');
    setUsername('');
  };

  return (
    <>
      <BottomSheet isVisible={isVisible}>
        <Title>참여자 정보를 입력해주세요</Title>
        <InputWrapper>
          <InputLabel>소속계열사</InputLabel>

          <TouchableOpacity onPress={() => console.log('드롭다운 열기')}>
            <AffiliateInput
              placeholder="소속 계열사를 입력해주세요"
              value={affiliate}
              pointerEvents="none"
              editable={false}
              placeholderTextColor={color.gray45}
            />
            <View
              style={{
                position: 'absolute',
                right: 20,
                top: '50%',
                transform: [{translateY: -10}],
              }}>
              <ArrowDownIcon width={16} height={16} />
            </View>
          </TouchableOpacity>
        </InputWrapper>
        <InputWrapper>
          <InputLabel>이름</InputLabel>
          <UsernameInput
            placeholder="이름을 입력해주세요"
            value={username}
            onChangeText={text => {
              setUsername(text);
            }}
            placeholderTextColor={color.gray45}
          />
        </InputWrapper>
        <ButtonContainer>
          <CloseButton
            text={'닫기'}
            textColor="black"
            buttonColor="gray10"
            fontFamily={font.pretendardMedium}
            onPress={() => {
              onPressCloseButton();
              reset();
            }}
          />
          <ConfirmButton
            isDisabled={isEmpty(affiliate) || isEmpty(username)}
            text={'참여하기'}
            textColor="white"
            buttonColor="brandColor"
            fontFamily={font.pretendardBold}
            onPress={() => {
              onPressConfirmButton(affiliate, username);
              reset();
            }}
          />
        </ButtonContainer>
      </BottomSheet>
    </>
  );
};

export default ChallengeDetailCompanyBottomSheet;

export const Title = styled.Text({
  color: color.black,
  fontSize: 20,
  fontFamily: font.pretendardBold,
  marginTop: 28,
  marginHorizontal: 24,
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

export const AffiliateInput = styled.TextInput({
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

export const UsernameInput = styled.TextInput({
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
