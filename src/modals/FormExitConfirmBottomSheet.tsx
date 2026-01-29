import React from 'react';
import styled from 'styled-components/native';

import {SccButton} from '@/components/atoms';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import BottomSheet from '@/modals/BottomSheet/BottomSheet';
import {Image} from 'react-native';

interface FormExitConfirmBottomSheetProps {
  isVisible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function FormExitConfirmBottomSheet({
  isVisible,
  onConfirm,
  onCancel,
}: FormExitConfirmBottomSheetProps) {
  return (
    <BottomSheet isVisible={isVisible} onPressBackground={onCancel}>
      <ContentsContainer>
        <IconContainer>
          <Image
            source={require('@/assets/img/img_memo.png')}
            style={{
              width: 75,
              height: 60,
            }}
          />
        </IconContainer>
        <Title>앗, 입력을 중단하시겠어요?</Title>
        <Description>
          {'작성 중인 내용은\n저장되지 않고 바로 삭제됩니다.'}
        </Description>
        <ButtonContainer>
          <SccButton
            text="나중에 하기"
            elementName="form_exit_confirm_button"
            onPress={onConfirm}
            buttonColor="gray20"
            textColor="gray70"
            fontFamily={font.pretendardMedium}
            height={48}
            style={{flex: 1, borderRadius: 14}}
          />
          <SccButton
            text="이어서 작성하기"
            elementName="form_exit_cancel_button"
            onPress={onCancel}
            buttonColor="brand40"
            textColor="white"
            fontFamily={font.pretendardSemibold}
            height={48}
            style={{flex: 1, borderRadius: 14}}
          />
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
  paddingTop: 16,
  paddingBottom: 12,
});

const Title = styled.Text({
  fontSize: 20,
  fontFamily: font.pretendardBold,
  color: color.black,
  textAlign: 'center',
  lineHeight: 28,
  letterSpacing: -0.4,
});

const Description = styled.Text({
  fontSize: 16,
  fontFamily: font.pretendardRegular,
  color: color.gray70,
  lineHeight: 24,
  textAlign: 'center',
  marginTop: 5,
  marginBottom: 12,
});

const ButtonContainer = styled.View({
  flexDirection: 'row',
  gap: 10,
  paddingVertical: 12,
});
