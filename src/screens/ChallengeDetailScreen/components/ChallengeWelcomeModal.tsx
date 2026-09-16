import {SccButton} from '@/components/atoms';
import SccRemoteImage from '@/components/SccRemoteImage';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import React, {useEffect, useState} from 'react';
import {Image, Modal, ModalProps} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import styled from 'styled-components/native';

// Figma 166:7054 실측: 296x388(3x 에셋 888x1164), 280px 높이 창에서 top -83 만큼
// 올려 하단 위주로 크롭해 보여준다.
const LOCAL_IMAGE_WIDTH = 296;
const LOCAL_IMAGE_HEIGHT = 388;
const LOCAL_IMAGE_TOP_OFFSET = -83;

const DEFAULT_DESCRIPTION = '우리 함께 계단 정복을 시작해볼까요?';
const DEFAULT_BUTTON_TEXT = '챌린지 참여하기';

interface ChallengeWelcomeModalProps extends ModalProps {
  /** 챌린지 어드민에 등록된 환영 팝업 이미지 URL. 없으면 기본 일러스트로 폴백. */
  imageUrl?: string | null;
  /** 챌린지 어드민에 등록된 환영 팝업 문구. 없으면 기본 문구로 폴백. */
  description?: string | null;
  buttonText?: string;
}

export default function ChallengeWelcomeModal({
  visible: _visible,
  imageUrl,
  description,
  buttonText = DEFAULT_BUTTON_TEXT,
  ...props
}: ChallengeWelcomeModalProps) {
  const [visible, setVisible] = useState(_visible);

  useEffect(() => {
    setVisible(_visible);
  }, [_visible]);

  return (
    <Modal visible={visible} statusBarTranslucent transparent {...props}>
      <Backdrop>
        {/* dim 은 Backdrop 이 full-screen 으로 담당, 콘텐츠는 SafeContent 안에서 center 정렬 —
            home indicator/nav bar 와 겹치지 않게. */}
        <SafeContent edges={['top', 'bottom']}>
          <Container>
            <ImageWrapper>
              {imageUrl ? (
                // ponytail: 어드민이 임의 비율로 올린 원격 이미지는 -83 오프셋 크롭 대신
                // cover 로 280px 창을 그대로 채운다 — 정확한 크롭 위치가 필요하면 어드민에서
                // 이미지 자체를 조정. 로컬 기본 일러스트만 Figma 수치와 1:1로 맞춘다.
                <SccRemoteImage
                  imageUrl={imageUrl}
                  resizeMode="cover"
                  wrapperBackgroundColor={null}
                  style={{width: '100%', height: '100%'}}
                />
              ) : (
                <Image
                  source={require('@/assets/img/img_challenge_welcome_v2.png')}
                  style={{
                    position: 'absolute',
                    top: LOCAL_IMAGE_TOP_OFFSET,
                    left: '50%',
                    marginLeft: -LOCAL_IMAGE_WIDTH / 2,
                    width: LOCAL_IMAGE_WIDTH,
                    height: LOCAL_IMAGE_HEIGHT,
                  }}
                  resizeMode="cover"
                />
              )}
            </ImageWrapper>
            <TextBlock>
              <Title>챌린지 참여를 환영합니다!</Title>
              <Description>{description ?? DEFAULT_DESCRIPTION}</Description>
            </TextBlock>
            <ButtonContainer>
              <ConfirmButton
                text={buttonText}
                textColor="white"
                buttonColor="blue50"
                fontFamily={font.pretendardBold}
                onPress={() => setVisible(false)}
                elementName="challenge_welcome_confirm"
              />
            </ButtonContainer>
          </Container>
        </SafeContent>
      </Backdrop>
    </Modal>
  );
}

const Backdrop = styled.View({
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.7)',
});

const SafeContent = styled(SafeAreaView)({
  flex: 1,
  justifyContent: 'center',
  padding: 20,
});

const Container = styled.View({
  backgroundColor: color.white,
  borderRadius: 20,
  overflow: 'hidden',
});

const ImageWrapper = styled.View({
  height: 280,
  overflow: 'hidden',
  position: 'relative',
});

const TextBlock = styled.View({
  gap: 4,
  alignItems: 'center',
  paddingHorizontal: 30,
  paddingBottom: 10,
  paddingTop: 10,
});

export const Title = styled.Text({
  color: color.black,
  fontSize: 20,
  lineHeight: 28,
  fontFamily: font.pretendardBold,
  textAlign: 'center',
});

export const Description = styled.Text({
  color: color.gray80,
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
