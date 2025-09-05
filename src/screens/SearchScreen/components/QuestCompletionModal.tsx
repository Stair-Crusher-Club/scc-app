import {SccButton} from '@/components/atoms';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {SccTouchableWithoutFeedback} from '@/components/SccTouchableWithoutFeedback';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import useNavigation from '@/navigation/useNavigation';
import {useAtomValue, useSetAtom} from 'jotai';
import React, {useEffect} from 'react';
import {Modal} from 'react-native';
import styled from 'styled-components/native';
import {
  closeAllAtom,
  currentAtom,
  indexAtom,
  isLastAtom,
  nextOrCloseAtom,
  visibleAtom,
} from '../atoms/quest';
import QuestClearStamp from './QuestClearStamp';

interface QuestCompletionModalProps {
  onMoveToQuestClearPage: () => void;
}

export default function QuestCompletionModal({
  onMoveToQuestClearPage,
}: QuestCompletionModalProps) {
  const navigation = useNavigation();

  const visible = useAtomValue(visibleAtom);
  const current = useAtomValue(currentAtom);
  const isLast = useAtomValue(isLastAtom);
  const nextOrClose = useSetAtom(nextOrCloseAtom);
  const closeAll = useSetAtom(closeAllAtom);
  const setIndex = useSetAtom(indexAtom);

  useEffect(() => {
    if (!visible) setIndex(0);
  }, [visible, setIndex]);

  if (!visible || !current) return null;

  const handlePrimary = () => {
    if (isLast) {
      onMoveToQuestClearPage();
      navigation.navigate('ChallengeDetail', {
        challengeId: current.challengeId,
      });
      closeAll();
    } else {
      nextOrClose();
    }
  };

  const handleBackdropPress = () => {
    closeAll();
  };

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade">
      <SccTouchableWithoutFeedback
        elementName="quest_completion_modal_backdrop"
        onPress={handleBackdropPress}>
        <Backdrop>
          <Center>
            <CompletionImage />
            <QuestClearStamp type={current.type} />
          </Center>

          <TitleText>
            {`${current.title} 퀘스트를 클리어했어요!\n크러셔님의 참여가 쉬운 이동을 만듭니다.`}
          </TitleText>

          <ButtonContainer>
            <SccButton
              text={isLast ? '클리어 스탬프 확인하기' : '다음'}
              textColor="white"
              fontFamily={font.pretendardBold}
              onPress={handlePrimary}
            />

            {isLast && (
              <SccTouchableOpacity
                elementName="quest_completion_continue_conquering_button"
                onPress={closeAll}>
                <CloseModalText>계속 정복하기</CloseModalText>
              </SccTouchableOpacity>
            )}
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
  gap: 60,
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

const CloseModalText = styled.Text({
  textAlign: 'center',
  color: color.white,
  fontFamily: font.pretendardBold,
  fontSize: 16,
  lineHeight: 24,
});
