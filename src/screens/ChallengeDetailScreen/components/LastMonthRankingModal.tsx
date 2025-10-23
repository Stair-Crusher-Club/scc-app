import React, {useEffect, useState, useRef} from 'react';
import {
  Image,
  Modal,
  ModalProps,
  Animated,
  Dimensions,
} from 'react-native';
import styled from 'styled-components/native';

import IcX from '@/assets/icon/ic_x_black.svg';

import SccPressable from '@/components/SccPressable';
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
  const [imageLoading, setImageLoading] = useState(true);
  const [imageHeight, setImageHeight] = useState<number | undefined>();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setVisible(_visible);
    if (_visible) {
      setImageLoading(true);
      fadeAnim.setValue(0);

      // Get image dimensions and calculate height for width 100%
      const screenWidth = Dimensions.get('window').width;
      const containerWidth = screenWidth - 40; // padding 20px on each side

      Image.getSize(
        imageUrl,
        (width, height) => {
          // Calculate height maintaining aspect ratio
          const calculatedHeight = (containerWidth / width) * height;
          setImageHeight(calculatedHeight);
        },
        () => {
          // Error callback
        },
      );
    }
  }, [_visible, fadeAnim, imageUrl]);

  useEffect(() => {
    if (!imageLoading && imageHeight !== undefined) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [imageLoading, imageHeight, fadeAnim]);

  const handleClose = () => {
    setVisible(false);
    onClose();
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };
  console.log('fuckfuck 2', visible, imageLoading, imageHeight);

  return (
    <Modal visible={visible} statusBarTranslucent transparent {...props}>
      <AnimatedBackdrop style={{opacity: fadeAnim}}>
        <Container>
          <ImageWrapper style={{height: imageHeight}}>
            <RankingImage
              source={{uri: imageUrl}}
              resizeMode="cover"
              onLoad={handleImageLoad}
              onError={() => setImageLoading(false)}
            />
            <CloseButton
              onPress={handleClose}
              elementName="last_month_ranking_modal_close"
              logParams={{challengeId}}>
              <IcX />
            </CloseButton>
          </ImageWrapper>
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

const ImageWrapper = styled.View({
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: color.gray10,
});

const RankingImage = styled(Image)({
  width: '100%',
  height: '100%',
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
