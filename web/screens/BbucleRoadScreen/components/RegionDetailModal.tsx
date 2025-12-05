import React, { useState, useCallback } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import styled from 'styled-components/native';
import type { BbucleRoadClickableRegionDto } from '@/generated-sources/openapi';

import SccRemoteImage from '@/components/SccRemoteImage';
import { color } from '@/constant/color';
import Logger from '@/logging/Logger';
import { useResponsive } from '../context/ResponsiveContext';

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
  const { windowWidth, isDesktop } = useResponsive();
  const [currentIndex, setCurrentIndex] = useState(0);
  const imageWidth = isDesktop ? Math.min(windowWidth * 0.6, 800) : Math.min(windowWidth - 48, 600);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / imageWidth);
      setCurrentIndex(index);
    },
    [imageWidth],
  );

  const handleClose = useCallback(() => {
    // 모달 닫기 로깅
    Logger.logElementClick({
      name: 'bbucle-road-modal-close',
      currScreenName: 'BbucleRoad',
      extraParams: { regionId: region?.id, isDesktop },
    });
    setCurrentIndex(0);
    onClose();
  }, [onClose, region?.id]);

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
      <ModalOverlay onPress={handleClose}>
        <ContentWrapper activeOpacity={1}>
          <ModalContent>
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
        </ContentWrapper>
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

const ContentWrapper = styled(TouchableOpacity)``;

const ModalContent = styled(View)``;

const ImageContainer = styled(View)`
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
  background-color: ${({ active }) => (active ? color.iosBlue : color.gray30)};
`;
