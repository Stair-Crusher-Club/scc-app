import {SccButton} from '@/components/atoms';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {ChallengeQuestCompleteStampTypeDto} from '@/generated-sources/openapi';
import useNavigation from '@/navigation/useNavigation';
import {useAtomValue, useSetAtom} from 'jotai';
import {LottieViewProps} from 'lottie-react-native';
import React, {useEffect} from 'react';
import {Modal, TouchableOpacity, TouchableWithoutFeedback} from 'react-native';
import styled from 'styled-components/native';
import {
  closeAllAtom,
  currentAtom,
  indexAtom,
  isLastAtom,
  nextOrCloseAtom,
  visibleAtom,
} from '../atoms/quest';
import StampLottie from './QuestClearStamp';

const stampLottie: Record<
  ChallengeQuestCompleteStampTypeDto,
  LottieViewProps['source']
> = {
  FLAG: require('@/assets/animations/flag.lottie'),
  CAFE: require('@/assets/animations/cafe.lottie'),
  THUMBS_UP: require('@/assets/animations/good.lottie'),
  POTION: require('@/assets/animations/potion.lottie'),
  RESTAURANT: require('@/assets/animations/restaurant.lottie'),
  REVIEW: require('@/assets/animations/review.lottie'),
};

export default function QuestCompletionModal() {
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
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <Backdrop>
          <Center>
            <CompletionImage />
            <StampLottie source={stampLottie[current.type]} />
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

            <TouchableOpacity onPress={closeAll}>
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
  paddingBottom: 80,
  gap: 48,
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
