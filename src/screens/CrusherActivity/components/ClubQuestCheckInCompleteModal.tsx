import {SccButton} from '@/components/atoms';
import {SccTouchableWithoutFeedback} from '@/components/SccTouchableWithoutFeedback';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import React from 'react';
import {Modal} from 'react-native';
import styled from 'styled-components/native';

interface ClubQuestCheckInCompleteModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ClubQuestCheckInCompleteModal({
  visible,
  onClose,
}: ClubQuestCheckInCompleteModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade">
      <SccTouchableWithoutFeedback
        elementName="club_quest_check_in_complete_modal_backdrop"
        onPress={onClose}>
        <Backdrop>
          <Center>
            <CompletionImage />
          </Center>

          <TitleText>
            {`정복활동 출석체크가 완료되었습니다.\n퀘스트 클리어까지 화이팅!`}
          </TitleText>

          <ButtonContainer>
            <SccButton
              text="확인"
              textColor="white"
              fontFamily={font.pretendardBold}
              onPress={onClose}
              elementName="club_quest_check_in_complete_confirm_button"
            />
          </ButtonContainer>
        </Backdrop>
      </SccTouchableWithoutFeedback>
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
  paddingBottom: 92,
});

const CompletionImage = styled.Image.attrs({
  source: require('@/assets/img/quest_completion.png'),
})({
  width: 271,
  height: 77,
});

const TitleText = styled.Text({
  marginBottom: 20,
  textAlign: 'center',
  color: color.white,
  fontFamily: font.pretendardRegular,
  fontSize: 16,
  lineHeight: 24,
});

const ButtonContainer = styled.View({
  padding: 20,
  gap: 20,
});
