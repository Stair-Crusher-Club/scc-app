import React, {useEffect, useState, useRef} from 'react';
import {Modal, ModalProps, Animated, Dimensions} from 'react-native';
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
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const screenWidth = Dimensions.get('window').width;
  const containerWidth = screenWidth - 40; // padding 20px on each side

  useEffect(() => {
    setVisible(_visible);
    if (_visible) {
      fadeAnim.setValue(0);
    }
  }, [_visible, fadeAnim]);

  const handleClose = () => {
    setVisible(false);
    onClose();
  };

  const handleImageReady = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Modal visible={visible} statusBarTranslucent transparent {...props}>
      <AnimatedBackdrop style={{opacity: fadeAnim}}>
        <Container>
          <ImageContainer>
            <SccRemoteImage
              imageUrl={imageUrl}
              containerWidth={containerWidth}
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
              <CheckboxRow>
                <Checkbox checked={false} />
                <CheckboxLabel>오늘 하루동안 보지 않기</CheckboxLabel>
              </CheckboxRow>
            </SccPressable>
          </CheckboxContainer>
        </Container>
      </AnimatedBackdrop>
    </Modal>
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

const CheckboxRow = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
});

const Checkbox = styled.View<{checked: boolean}>(({checked}) => ({
  width: 20,
  height: 20,
  borderRadius: 6,
  borderWidth: 1.6,
  borderColor: color.gray25,
  backgroundColor: checked ? color.brand60 : color.white,
  justifyContent: 'center',
  alignItems: 'center',
}));

const CheckboxLabel = styled.Text({
  color: color.gray70,
  fontSize: 14,
  height: 20,
  fontFamily: font.pretendardRegular,
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
