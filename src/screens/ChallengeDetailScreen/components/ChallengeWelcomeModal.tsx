import {SccButton} from '@/components/atoms';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {useEffect, useState} from 'react';
import {Image, Modal, ModalProps, View} from 'react-native';
import styled from 'styled-components/native';

export default function ChallengeWelcomeModal({
  visible: _visible,
  ...props
}: ModalProps) {
  const [visible, setVisible] = useState(_visible);

  useEffect(() => {
    setVisible(_visible);
  }, [_visible]);

  return (
    <Modal visible={visible} statusBarTranslucent transparent {...props}>
      <Backdrop>
        <Container>
          <ImageWrapper>
            <Image
              source={require('@/assets/img/img_challenge_welcome.png')}
              style={{
                width: 200,
                height: 176,
              }}
            />
          </ImageWrapper>
          <View>
            <Title>챌린지 참여를 환영합니다!</Title>
            <Description>우리 함께 계단 정복을 시작해볼까요?</Description>
          </View>
          <ButtonContainer>
            <ConfirmButton
              text="확인"
              textColor="white"
              buttonColor="brandColor"
              fontFamily={font.pretendardBold}
              onPress={() => setVisible(false)}
            />
          </ButtonContainer>
        </Container>
      </Backdrop>
    </Modal>
  );
}

const Backdrop = styled.View({
  flex: 1,
  justifyContent: 'center',
  backgroundColor: 'rgba(0,0,0,0.5)',
  padding: 20,
});

const Container = styled.View({
  backgroundColor: color.white,
  borderRadius: 20,
});

const ImageWrapper = styled.View({
  justifyContent: 'center',
  alignItems: 'center',
  paddingTop: 30,
  paddingBottom: 10,
});

export const Title = styled.Text({
  color: color.black,
  fontSize: 20,
  lineHeight: 28,
  fontFamily: font.pretendardBold,
  textAlign: 'center',
});

export const Description = styled.Text({
  color: color.black,
  fontSize: 16,
  lineHeight: 24,
  fontFamily: font.pretendardRegular,
  textAlign: 'center',
});

export const ButtonContainer = styled.View({
  flexDirection: 'row',
  gap: 10,
  paddingVertical: 20,
  paddingHorizontal: 20,
});

export const ConfirmButton = styled(SccButton)`
  flex: 1;
`;
