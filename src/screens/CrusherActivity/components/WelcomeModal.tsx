import {useMe} from '@/atoms/Auth';
import {SccButton} from '@/components/atoms';
import SccTouchableWithoutFeedback from '@/components/SccTouchableWithoutFeedback';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import Logger from '@/logging/Logger';
import LottieView from 'lottie-react-native';
import React, {useEffect, useState} from 'react';
import {Image, Modal, View, useWindowDimensions} from 'react-native';
import styled from 'styled-components/native';
import WelcomeAnimation from './WelcomeAnimation';

interface WelcomeModalProps {
  questTypeOrActivityId: string | null | undefined;
}

type ModalAnimationType =
  | {type: 'lottie'}
  | {type: 'image'; source: ReturnType<typeof require>};

type TextPart = {text: string; bold: boolean};

const MODAL_CONFIG: Record<
  string,
  {
    buttonText: string;
    getTextParts: (nickname: string) => TextPart[];
    animation: ModalAnimationType;
  }
> = {
  STARTING_DAY: {
    buttonText: '앞으로 잘해봐요!',
    getTextParts: (nickname: string) => [
      {text: "'25 가을시즌 크러셔클럽", bold: true},
      {text: '에 온 크루\n', bold: false},
      {text: nickname, bold: true},
      {text: '님 환영합니다!', bold: false},
    ],
    animation: {type: 'lottie'},
  },
  impactSession: {
    buttonText: '출석 완료!',
    getTextParts: (nickname: string) => [
      {text: '임팩트 세션', bold: true},
      {text: '에 온 크루\n', bold: false},
      {text: nickname, bold: true},
      {text: '님 환영합니다!', bold: false},
    ],
    animation: {
      type: 'image',
      source: require('@/assets/img/img_impact_session_modal.png'),
    },
  },
};

export default function WelcomeModal({
  questTypeOrActivityId,
}: WelcomeModalProps) {
  const {userInfo} = useMe();
  const {width: viewportWidth} = useWindowDimensions();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!!questTypeOrActivityId);
  }, [questTypeOrActivityId]);

  const handleClose = () => {
    setVisible(false);
  };

  if (!questTypeOrActivityId) {
    return null;
  }

  const config = MODAL_CONFIG[questTypeOrActivityId];
  if (!config) {
    return null;
  }

  const textParts = config.getTextParts(userInfo?.nickname || '');

  const renderAnimation = () => {
    if (config.animation.type === 'image') {
      return (
        <Image
          source={config.animation.source}
          style={{
            width: viewportWidth * 0.8,
            height: viewportWidth * 0.8,
          }}
          resizeMode="contain"
        />
      );
    }

    return (
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <LottieView
          onAnimationFailure={error => {
            Logger.logError(
              new Error(
                `Lottie animation error [crusher_activity_welcome.lottie]: ${error}`,
              ),
            );
          }}
          source={require('@/assets/animations/crusher_activity_welcome.lottie')}
          autoPlay
          loop
          style={{
            width: viewportWidth * 0.65,
            height: viewportWidth * 0.2,
            bottom: viewportWidth * -0.1,
          }}
        />
        <WelcomeAnimation />
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade">
      <SccTouchableWithoutFeedback
        elementName="crusher_activity_welcome_modal"
        onPress={handleClose}>
        <Backdrop>
          <Center>
            {renderAnimation()}
            <WelcomeText>
              {textParts.map((part, index) =>
                part.bold ? (
                  <WelcomeTextBold key={index}>{part.text}</WelcomeTextBold>
                ) : (
                  <WelcomeTextRegular key={index}>
                    {part.text}
                  </WelcomeTextRegular>
                ),
              )}
            </WelcomeText>
          </Center>

          <ButtonContainer>
            <SccButton
              elementName="crusher_activity_welcome_modal_ok"
              text={config.buttonText}
              textColor="white"
              fontFamily={font.pretendardBold}
              onPress={handleClose}
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
  gap: 40,
});

const WelcomeText = styled.Text({
  marginBottom: 20,
  textAlign: 'center',
  color: color.white,
  fontSize: 20,
  lineHeight: 28,
});

const WelcomeTextBold = styled.Text({
  color: color.white,
  fontFamily: font.pretendardBold,
  fontSize: 20,
  lineHeight: 28,
});

const WelcomeTextRegular = styled.Text({
  color: color.white,
  fontFamily: font.pretendardRegular,
  fontSize: 20,
  lineHeight: 28,
});

const ButtonContainer = styled.View({
  padding: 20,
  gap: 20,
});
