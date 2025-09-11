import {useMe} from '@/atoms/Auth';
import {SccButton} from '@/components/atoms';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import React, {useEffect, useState} from 'react';
import {Modal, ModalProps, TouchableWithoutFeedback} from 'react-native';
import styled from 'styled-components/native';

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
      <TouchableWithoutFeedback onPress={handleClose}>
        <Backdrop>
          <Center>
            <WelcomeImage />
            <WelcomeText>
              <WelcomeTextBold>‘25 가을시즌 크러셔클럽</WelcomeTextBold>에 온
              {'\n'}
              <WelcomeTextBold>{userInfo?.nickname}</WelcomeTextBold>님
              환영합니다!
            </WelcomeText>
          </Center>

          <ButtonContainer>
            <SccButton
              text="앞으로 잘해봐요!"
              textColor="white"
              fontFamily={font.pretendardBold}
              onPress={handleClose}
            />
          </ButtonContainer>

          <SCCLogoImage />
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
  gap: 20,
});

const WelcomeImage = styled.Image.attrs({
  source: require('@/assets/img/img_crusher_welcome.png'),
})({
  width: 290,
  height: 271,
});

const WelcomeText = styled.Text({
  marginBottom: 20,
  textAlign: 'center',
  color: color.white,
  fontFamily: font.pretendardRegular,
  fontSize: 16,
  lineHeight: 24,
});

const WelcomeTextBold = styled.Text({
  marginBottom: 20,
  textAlign: 'center',
  color: color.white,
  fontFamily: font.pretendardBold,
  fontSize: 16,
  lineHeight: 24,
});

const ButtonContainer = styled.View({
  padding: 20,
  gap: 20,
});

const SCCLogoImage = styled.Image.attrs({
  source: require('@/assets/img/img_scc_logo_white.png'),
})({
  position: 'absolute',
  width: 98,
  height: 37,
  bottom: 50,
  alignSelf: 'center',
});
