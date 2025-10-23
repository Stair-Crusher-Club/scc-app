import React, {useEffect, useState} from 'react';
import {Image, Modal, ModalProps, ActivityIndicator, TouchableOpacity} from 'react-native';
import styled from 'styled-components/native';

import IcX from '@/assets/icon/ic_x_black.svg';

import SccPressable from '@/components/SccPressable';
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

  useEffect(() => {
    setVisible(_visible);
  }, [_visible]);

  const handleClose = () => {
    setVisible(false);
    onClose();
  };

  return (
    <Modal visible={visible} statusBarTranslucent transparent {...props}>
      <Backdrop>
        <Container>
          <ImageWrapper>
            {imageLoading && (
              <LoadingContainer>
                <ActivityIndicator size="large" color={color.brand60} />
              </LoadingContainer>
            )}
            <RankingImage
              source={{uri: imageUrl}}
              resizeMode="contain"
              onLoad={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
            />
            <CloseButton onPress={handleClose}>
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
      </Backdrop>
    </Modal>
  );
}

const Backdrop = styled.View({
  flex: 1,
  justifyContent: 'center',
  backgroundColor: 'rgba(0,0,0,0.7)',
  padding: 20,
});

const Container = styled.View({
  backgroundColor: color.white,
  borderRadius: 20,
  overflow: 'hidden',
});

const ImageWrapper = styled.View({
  width: '100%',
  aspectRatio: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: color.gray10,
});

const LoadingContainer = styled.View({
  position: 'absolute',
  width: '100%',
  height: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1,
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

const CloseButton = styled(TouchableOpacity)({
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
