import React, { useState, useCallback } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  Text,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import styled from 'styled-components/native';
import type { BbucleRoadClickableRegionDto } from '@/generated-sources/openapi';

import SccRemoteImage from '@/components/SccRemoteImage';

interface RegionDetailModalProps {
  visible: boolean;
  region: BbucleRoadClickableRegionDto | null;
  onClose: () => void;
}

export default function RegionDetailModal({
  visible,
  region,
  onClose,
}: RegionDetailModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const screenWidth = Dimensions.get('window').width;
  const imageWidth = Math.min(screenWidth - 48, 600);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / imageWidth);
      setCurrentIndex(index);
    },
    [imageWidth],
  );

  const handleClose = useCallback(() => {
    setCurrentIndex(0);
    onClose();
  }, [onClose]);

  if (!region) {
    return null;
  }

  const imageUrls = region.modalImageUrls || [];
  const hasMultipleImages = imageUrls.length > 1;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <ModalOverlay>
        <ModalContent>
          <CloseButton onPress={handleClose}>
            <CloseButtonText>✕</CloseButtonText>
          </CloseButton>

          {imageUrls.length > 0 && (
            <ImageContainer>
              <ImageScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
              >
                {imageUrls.map((imageUrl, index) => (
                  <ImageWrapper key={index} style={{ width: imageWidth }}>
                    <SccRemoteImage
                      imageUrl={imageUrl}
                      resizeMode="contain"
                      style={{ borderRadius: 8 }}
                    />
                  </ImageWrapper>
                ))}
              </ImageScrollView>

              {hasMultipleImages && (
                <PageIndicatorContainer>
                  {imageUrls.map((_, index) => (
                    <PageDot key={index} active={index === currentIndex} />
                  ))}
                </PageIndicatorContainer>
              )}
            </ImageContainer>
          )}
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
}

const ModalOverlay = styled(TouchableOpacity).attrs({
  activeOpacity: 1,
})`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.7);
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled(View)`
  background-color: #fff;
  border-radius: 16px;
  padding: 24px;
  max-width: 90%;
  max-height: 80%;
  position: relative;
`;

const CloseButton = styled(TouchableOpacity)`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: rgba(0, 0, 0, 0.1);
  justify-content: center;
  align-items: center;
  z-index: 10;
`;

const CloseButtonText = styled(Text)`
  font-size: 18px;
  color: #333;
`;

const ImageContainer = styled(View)`
  margin-top: 20px;
`;

const ImageScrollView = styled(ScrollView)`
  border-radius: 8px;
  overflow: hidden;
`;

const ImageWrapper = styled(View)`
  justify-content: center;
  align-items: center;
`;

const PageIndicatorContainer = styled(View)`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-top: 12px;
  gap: 8px;
`;

const PageDot = styled(View)<{ active: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: ${({ active }) => (active ? '#007AFF' : '#D1D5DB')};
`;
