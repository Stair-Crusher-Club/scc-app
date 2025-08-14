import {SccButton} from '@/components/atoms';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import React from 'react';
import {
  Modal,
  ModalProps,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import styled from 'styled-components/native';

interface QuestCompletionModalProps extends ModalProps {
  onClose?: () => void;
}

export default function QuestCompletionModal({
  visible = false,
  onClose,
  ...props
}: QuestCompletionModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade"
      {...props}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Backdrop>
          <Center>
            <CompletionImage />
            <StampImage />
          </Center>

          <TitleText>
            {`방문리뷰 등록 퀘스트를 클리어했어요!\n다음 퀘스트도 함께 가볼까요?`}
          </TitleText>

          <ButtonContainer>
            <SccButton
              text="클리어 뱃지 확인하기!"
              textColor="white"
              fontFamily={font.pretendardBold}
              onPress={() => {
                // TODO: 퀘스트 상세페이지로 이동
              }}
            />

            <TouchableOpacity onPress={onClose}>
              <CloseModalText>계속 정복하기</CloseModalText>
            </TouchableOpacity>
          </ButtonContainer>
        </Backdrop>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const Backdrop = styled.View({
  flex: 1,
  justifyContent: 'center',
  backgroundColor: 'rgba(0,0,0,0.8)',
});

const Center = styled.View({
  justifyContent: 'center',
  alignItems: 'center',
});

const CompletionImage = styled.Image.attrs({
  source: require('@/assets/img/quest_completion.png'),
})({
  width: 254,
  height: 88,
});

const StampImage = styled.Image.attrs({
  source: require('@/assets/img/stamp.png'),
})({
  width: 160,
  height: 160,
});

const TitleText = styled.Text({
  marginTop: 24,
  marginBottom: 20,
  textAlign: 'center',
  color: color.white,
  fontFamily: font.pretendardBold,
  fontSize: 18,
  lineHeight: 26,
});

const ButtonContainer = styled.View({
  padding: 20,
  gap: 20,
});

const CloseModalText = styled.Text({
  textAlign: 'center',
  color: color.white,
  fontFamily: font.pretendardBold,
  fontSize: 16,
  lineHeight: 24,
});
