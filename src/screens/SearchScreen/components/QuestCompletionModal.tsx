import {SccButton} from '@/components/atoms';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import useNavigation from '@/navigation/useNavigation';
import {QuestStampType} from '@/screens/ChallengeDetailScreen/components/ChallengeDetailQuestSection/QuestItem';
import {LottieViewProps} from 'lottie-react-native';
import React from 'react';
import {
  Modal,
  ModalProps,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import styled from 'styled-components/native';
import StampLottie from './QuestClearStamp';

const stampLottie: Record<QuestStampType, LottieViewProps['source']> = {
  FLAG: require('@/assets/animations/flag.lottie'),
  CAFE: require('@/assets/animations/cafe.lottie'),
  GOOD: require('@/assets/animations/good.lottie'),
  POTION: require('@/assets/animations/potion.lottie'),
  RESTAURANT: require('@/assets/animations/restaurant.lottie'),
  REVIEW: require('@/assets/animations/review.lottie'),
};

interface QuestCompletionModalProps extends ModalProps {
  type: QuestStampType;
  challengeId: string;
  onClose?: () => void;
}

export default function QuestCompletionModal({
  type,
  challengeId,
  visible = false,
  onClose,
  ...props
}: QuestCompletionModalProps) {
  const navigation = useNavigation();

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
            <StampLottie source={stampLottie[type]} />
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
                navigation.navigate('ChallengeDetail', {challengeId});
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
  paddingBottom: 80,
  gap: 60,
});

const CompletionImage = styled.Image.attrs({
  source: require('@/assets/img/quest_completion.png'),
})({
  width: 254,
  height: 88,
});

const TitleText = styled.Text({
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
