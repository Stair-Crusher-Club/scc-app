import {useMe} from '@/atoms/Auth';
import {SccButton} from '@/components/atoms';
import SccTouchableWithoutFeedback from '@/components/SccTouchableWithoutFeedback';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import LottieView from 'lottie-react-native';
import React, {useEffect, useState} from 'react';
import {Modal, ModalProps, View} from 'react-native';
import styled from 'styled-components/native';
import WelcomeAnimation from './WelcomeAnimation';

export default function WelcomeModal({
  visible: _visible,
  ...props
}: ModalProps) {
  const {userInfo} = useMe();
  const [visible, setVisible] = useState(_visible);

  useEffect(() => {
    setVisible(_visible);
  }, [_visible]);

  const handleClose = () => {
    setVisible(false);
  };

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade"
      {...props}>
      <SccTouchableWithoutFeedback
        elementName="crusher_activity_welcome_modal"
        onPress={handleClose}>
        <Backdrop>
          <Center>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <LottieView
                source={require('@/assets/animations/crusher_activity_welcome.lottie')}
                autoPlay
                loop
                style={{
                  width: 225,
                  height: 60,
                }}
              />
              <WelcomeAnimation />
            </View>
            <WelcomeText>
              <WelcomeTextBold>‘25 가을시즌 크러셔클럽</WelcomeTextBold>에 온
              {'\n'}
              <WelcomeTextBold>{userInfo?.nickname}</WelcomeTextBold>님
              환영합니다!
            </WelcomeText>
          </Center>

          <ButtonContainer>
            <SccButton
              elementName="crusher_activity_welcome_modal_ok"
              text="앞으로 잘해봐요!"
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
  fontFamily: font.pretendardRegular,
  fontSize: 20,
  lineHeight: 28,
});

const WelcomeTextBold = styled.Text({
  marginBottom: 20,
  textAlign: 'center',
  color: color.white,
  fontFamily: font.pretendardBold,
  fontSize: 20,
  lineHeight: 28,
});

const ButtonContainer = styled.View({
  padding: 20,
  gap: 20,
});
