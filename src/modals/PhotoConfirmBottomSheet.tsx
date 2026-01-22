import React from 'react';
import styled from 'styled-components/native';

import {SccButton} from '@/components/atoms';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import BottomSheet from '@/modals/BottomSheet/BottomSheet';
import {Image} from 'react-native';

interface PhotoConfirmBottomSheetProps {
  isVisible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function PhotoConfirmBottomSheet({
  isVisible,
  onConfirm,
  onCancel,
}: PhotoConfirmBottomSheetProps) {
  return (
    <BottomSheet isVisible={isVisible} onPressBackground={onCancel}>
      <ContentsContainer>
        <IconContainer>
          <Image
            source={require('@/assets/img/camera.png')}
            style={{
              width: 75,
              height: 60,
            }}
          />
        </IconContainer>
        <Title>정말 사진없이 등록하실껀가요?</Title>
        <Description>
          {
            '계단뿌셔클럽 간담회에서 휠체어 사용자의 95%가\n사진이 있을 때 훨씬 도움이 된다고 답했어요!'
          }
        </Description>
        <ButtonContainer>
          <SccButton
            text="그냥 등록하기"
            elementName="photo_confirm_cancel_button"
            onPress={onCancel}
            buttonColor="gray20"
            textColor="gray70"
            fontFamily={font.pretendardMedium}
            height={48}
            style={{flex: 1, borderRadius: 14}}
          />
          <SccButton
            text="사진 추가하기"
            elementName="photo_confirm_button"
            onPress={onConfirm}
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
