import React from 'react';
import styled from 'styled-components/native';

import BottomSheet from '@/modals/BottomSheet/BottomSheet';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {SccPressable} from '@/components/SccPressable';
import WarningIcon from '@/assets/icon/ic_warning.svg';

interface LocationConfirmBottomSheetProps {
  isVisible: boolean;
  address: string;
  type: 'place' | 'building';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function LocationConfirmBottomSheet({
  isVisible,
  address,
  type,
  onConfirm,
  onCancel,
}: LocationConfirmBottomSheetProps) {
  const typeText = type === 'building' ? '건물' : '장소';

  return (
    <BottomSheet isVisible={isVisible} onPressBackground={onCancel}>
      <ContentsContainer>
        <IconContainer>
          <WarningIcon width={32} height={32} />
        </IconContainer>
        <Title>{`등록하려는 ${typeText}의 주소가\n맞는지 확인해주세요.`}</Title>
        <AddressBox>
          <AddressSubtitle>
            아래 주소의 {typeText} 정보를 등록합니다.
          </AddressSubtitle>
          <AddressText>{address}</AddressText>
        </AddressBox>
        <ButtonContainer>
          <CancelButton
            elementName="location_confirm_cancel_button"
            onPress={onCancel}>
            <CancelButtonText>취소</CancelButtonText>
          </CancelButton>
          <ConfirmButton
            elementName="location_confirm_button"
            onPress={onConfirm}>
            <ConfirmButtonText>확인</ConfirmButtonText>
          </ConfirmButton>
        </ButtonContainer>
      </ContentsContainer>
    </BottomSheet>
  );
}

const ContentsContainer = styled.View({
  paddingTop: 20,
  paddingHorizontal: 20,
});

const IconContainer = styled.View({
  alignItems: 'center',
  marginBottom: 8,
});

const Title = styled.Text({
  fontSize: 20,
  fontFamily: font.pretendardBold,
  color: '#16181C',
  textAlign: 'center',
  lineHeight: 28,
  letterSpacing: -0.4,
  marginBottom: 12,
});

const AddressBox = styled.View({
  backgroundColor: '#F7F8FA',
  borderRadius: 4,
  paddingVertical: 10,
  alignItems: 'center',
  marginBottom: 20,
});

const AddressSubtitle = styled.Text({
  fontSize: 14,
  fontFamily: font.pretendardRegular,
  color: '#585A64',
  lineHeight: 20,
  textAlign: 'center',
});

const AddressText = styled.Text({
  fontSize: 16,
  fontFamily: font.pretendardMedium,
  color: '#16181C',
  lineHeight: 24,
  textAlign: 'center',
});

const ButtonContainer = styled.View({
  flexDirection: 'row',
  gap: 10,
  paddingVertical: 12,
});

const CancelButton = styled(SccPressable)({
  flex: 1,
  height: 48,
  borderRadius: 14,
  backgroundColor: color.gray15,
  justifyContent: 'center',
  alignItems: 'center',
});

const CancelButtonText = styled.Text({
  fontSize: 16,
  fontFamily: font.pretendardMedium,
  color: '#24262B',
  lineHeight: 24,
});

const ConfirmButton = styled(SccPressable)({
  flex: 2,
  height: 48,
  borderRadius: 14,
  backgroundColor: color.brand40,
  justifyContent: 'center',
  alignItems: 'center',
});

const ConfirmButtonText = styled.Text({
  fontSize: 16,
  fontFamily: font.pretendardSemibold,
  color: color.white,
  lineHeight: 24,
});
