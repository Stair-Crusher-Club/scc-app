import React, {useEffect, useState, useRef} from 'react';
import {Modal, ModalProps, Animated} from 'react-native';
import styled from 'styled-components/native';

import IcX from '@/assets/icon/ic_x_black.svg';

import SccPressable from '@/components/SccPressable';
import SccRemoteImage from '@/components/SccRemoteImage';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {setDismissedToday} from '@/atoms/challengeModalAtoms';

interface LastMonthRankingModalProps extends ModalProps {
  challengeId: string;
  imageUrl: string;
  onClose: () => void;
}

export default function LastMonthRankingModal({
  challengeId,
  imageUrl,
  onClose,
  visible: _visible,
  ...props
}: LastMonthRankingModalProps) {
  const [visible, setVisible] = useState(_visible);
  const [isReady, setIsReady] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setVisible(_visible);
    if (_visible) {
      fadeAnim.setValue(0);
      setIsReady(false);
    }
  }, [_visible, fadeAnim]);

  const handleClose = () => {
    setVisible(false);
    onClose();
  };

  const handleImageReady = () => {
    setIsReady(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const content = (
    <AnimatedBackdrop style={{opacity: fadeAnim}}>
      <Container>
        <ImageContainer>
          <SccRemoteImage
            imageUrl={imageUrl}
            onReady={handleImageReady}
            resizeMode="cover"
          />
          <CloseButton
            onPress={handleClose}
            elementName="last_month_ranking_modal_close"
            logParams={{challengeId}}>
            <IcX />
          </CloseButton>
        </ImageContainer>
        <CheckboxContainer>
          <SccPressable
            onPress={() => {
              setDismissedToday(challengeId);
              setVisible(false);
              onClose();
            }}
            elementName="last_month_ranking_modal_dont_show_today"
            logParams={{challengeId}}>
            <DismissTodayLabel>오늘 하루동안 보지 않기</DismissTodayLabel>
          </SccPressable>
        </CheckboxContainer>
      </Container>
    </AnimatedBackdrop>
  );

  return isReady ? (
    <Modal visible={visible} statusBarTranslucent transparent {...props}>
      {content}
    </Modal>
  ) : (
    <HiddenView>{content}</HiddenView>
  );
}

const AnimatedBackdrop = styled(Animated.View)({
  flex: 1,
  justifyContent: 'center',
  backgroundColor: 'rgba(0,0,0,0.7)',
  padding: 20,
});

const Container = styled.View({
  width: '100%',
  backgroundColor: color.white,
  borderRadius: 20,
  overflow: 'hidden',
});

const ImageContainer = styled.View({
  width: '100%',
  position: 'relative',
});

const CheckboxContainer = styled.View({
  padding: 16,
});

const DismissTodayLabel = styled.Text({
  color: color.gray70,
  fontSize: 14,
  fontFamily: font.pretendardRegular,
  borderBottomWidth: 0.5,
  borderBottomColor: color.gray70,
  paddingBottom: 0,
  alignSelf: 'flex-start',
});

const CloseButton = styled(SccTouchableOpacity)({
  position: 'absolute',
  top: 18,
  right: 18,
  width: 20,
  height: 20,
  borderRadius: 10,
  backgroundColor: color.gray30,
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 2,
});

const HiddenView = styled.View({
  width: 0,
  height: 0,
});
