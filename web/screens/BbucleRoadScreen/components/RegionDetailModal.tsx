import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Text,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import styled from 'styled-components/native';
import type { BbucleRoadClickableRegionDto } from '@/generated-sources/openapi';

import SccRemoteImage from '@/components/SccRemoteImage';
import { color } from '@/constant/color';
import Logger from '@/logging/Logger';
import IcLeft from '@/assets/icon/ic_left.svg';
import IcRight from '@/assets/icon/ic_right.svg';
import { useResponsive } from '../context/ResponsiveContext';

interface ImageWithMeta {
  url: string;
  regionId: string;
  regionTitle: string;
}

interface RegionDetailModalProps {
  visible: boolean;
  allRegions?: BbucleRoadClickableRegionDto[];
  initialRegionId?: string;
  onClose: () => void;
}

export default function RegionDetailModal({
  visible,
  allRegions,
  initialRegionId,
  onClose,
}: RegionDetailModalProps) {
  const { isDesktop } = useResponsive();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const isScrollingProgrammatically = useRef(false);

  // 1. 모든 이미지를 flatmap + 메타데이터 유지
  const allImages: ImageWithMeta[] = useMemo(() => {
    return (allRegions ?? []).flatMap((region) =>
      (region.modalImageUrls || []).map((url) => ({
        url,
        regionId: region.id,
        regionTitle: region.title || '',
      })),
    );
  }, [allRegions]);

  // 2. 초기 인덱스 계산 (클릭한 region의 첫 이미지)
  const initialIndex = useMemo(() => {
    if (!initialRegionId) return 0;
    const idx = allImages.findIndex((img) => img.regionId === initialRegionId);
    return idx >= 0 ? idx : 0;
  }, [allImages, initialRegionId]);

  // 3. 모달 열릴 때 초기 인덱스로 설정 + 스크롤 이동
  useEffect(() => {
    if (visible && initialIndex >= 0) {
      setCurrentIndex(initialIndex);
      // 약간의 딜레이 후 스크롤 (렌더링 완료 후)
      setTimeout(() => {
        if (scrollViewRef.current) {
          const pageWidth = isDesktop ? 600 : window.innerWidth - 48;
          scrollViewRef.current.scrollTo({ x: initialIndex * pageWidth, animated: false });
        }
      }, 50);
    }
  }, [visible, initialIndex, isDesktop]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      // 프로그래매틱 스크롤 중에는 무시
      if (isScrollingProgrammatically.current) return;

      const offsetX = event.nativeEvent.contentOffset.x;
      const pageWidth = event.nativeEvent.layoutMeasurement.width;
      if (pageWidth > 0) {
        const index = Math.round(offsetX / pageWidth);
        setCurrentIndex(index);
      }
    },
    [],
  );

  const handleClose = useCallback(() => {
    Logger.logElementClick({
      name: 'bbucle-road-modal-close',
      currScreenName: 'BbucleRoad',
      extraParams: { regionId: initialRegionId, isDesktop },
    });
    setCurrentIndex(0);
    onClose();
  }, [onClose, initialRegionId, isDesktop]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      if (scrollViewRef.current) {
        isScrollingProgrammatically.current = true;
        const pageWidth = isDesktop ? 600 : window.innerWidth - 48;
        scrollViewRef.current.scrollTo({ x: newIndex * pageWidth, animated: true });
      }
    }
  }, [currentIndex, isDesktop]);

  const handleNext = useCallback(() => {
    if (currentIndex < allImages.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      if (scrollViewRef.current) {
        isScrollingProgrammatically.current = true;
        const pageWidth = isDesktop ? 600 : window.innerWidth - 48;
        scrollViewRef.current.scrollTo({ x: newIndex * pageWidth, animated: true });
      }
    }
  }, [currentIndex, allImages.length, isDesktop]);

  const handleDotPress = useCallback((index: number) => {
    setCurrentIndex(index);
    if (scrollViewRef.current) {
      isScrollingProgrammatically.current = true;
      const pageWidth = isDesktop ? 600 : window.innerWidth - 48;
      scrollViewRef.current.scrollTo({ x: index * pageWidth, animated: true });
    }
  }, [isDesktop]);

  const handleMomentumScrollEnd = useCallback(() => {
    isScrollingProgrammatically.current = false;
  }, []);

  if (allImages.length === 0) {
    return null;
  }

  const currentImage = allImages[currentIndex];
  const hasMultipleImages = allImages.length > 1;
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < allImages.length - 1;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <ModalOverlay onPress={handleClose}>
        <ContentWrapper activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <ModalContent isDesktop={isDesktop}>
            {/* 이미지 + 네비게이션 영역 */}
            <ImageNavContainer>
              {/* 왼쪽 화살표 - 데스크톱에서만 표시 */}
              {isDesktop && hasMultipleImages && (
                <NavButton
                  onPress={handlePrev}
                  disabled={!canGoPrev}
                  isHidden={!canGoPrev}
                >
                  <IcLeft width={11} height={21} viewBox={'0 0 11 21'} color={color.gray80} />
                </NavButton>
              )}

              {/* 이미지 슬라이더 */}
              <ImageContainer isDesktop={isDesktop}>
                <ImageScrollView
                  ref={scrollViewRef}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onScroll={handleScroll}
                  onMomentumScrollEnd={handleMomentumScrollEnd}
                  scrollEventThrottle={16}
                  contentOffset={{ x: initialIndex * (isDesktop ? 600 : window.innerWidth - 48), y: 0 }}
                >
                  {allImages.map((image, index) => (
                    <ImageWrapper key={`${image.regionId}-${index}`} isDesktop={isDesktop}>
                      <SccRemoteImage
                        imageUrl={image.url}
                        resizeMode="contain"
                        style={{ borderRadius: 0 }}
                        wrapperBackgroundColor={null}
                      />
                    </ImageWrapper>
                  ))}
                </ImageScrollView>
              </ImageContainer>

              {/* 오른쪽 화살표 - 데스크톱에서만 표시 */}
              {isDesktop && hasMultipleImages && (
                <NavButton
                  onPress={handleNext}
                  disabled={!canGoNext}
                  isHidden={!canGoNext}
                >
                  <IcRight width={11} height={21} viewBox={'0 0 11 21'} color={color.gray80} />
                </NavButton>
              )}
            </ImageNavContainer>

            {/* 페이지 인디케이터 */}
            {hasMultipleImages && (
              <PageIndicatorContainer>
                {allImages.map((_, index) => (
                  <PageDotButton key={index} onPress={() => handleDotPress(index)}>
                    <PageDot active={index === currentIndex} />
                  </PageDotButton>
                ))}
              </PageIndicatorContainer>
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
  background-color: rgba(0, 0, 0, 0.8);
  justify-content: center;
  align-items: center;
`;

const ContentWrapper = styled(TouchableOpacity).attrs({
  activeOpacity: 1,
})``;

const ModalContent = styled(View)<{ isDesktop: boolean }>`
  align-items: center;
  gap: 20px;
  max-width: ${({ isDesktop }) => (isDesktop ? '736px' : 'calc(100vw - 32px)')};
`;

const ImageNavContainer = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 20px;
`;

interface NavButtonProps {
  onPress: () => void;
  disabled?: boolean;
  isHidden: boolean;
  children: React.ReactNode;
}

function NavButton({ onPress, disabled, isHidden, children }: NavButtonProps) {
  return (
    <NavButtonContainer
      onPress={onPress}
      disabled={disabled || isHidden}
      style={{ opacity: isHidden ? 0 : 1 }}
    >
      {children}
    </NavButtonContainer>
  );
}

const NavButtonContainer = styled(Pressable)`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: ${color.white};
  justify-content: center;
  align-items: center;
  shadow-color: #000;
  shadow-offset: 0px 0px;
  shadow-opacity: 0.25;
  shadow-radius: 4px;
  elevation: 4;
`;

const ImageContainer = styled(View)<{ isDesktop: boolean }>`
  width: ${({ isDesktop }) => (isDesktop ? '600px' : 'calc(100vw - 48px)')};
  overflow: hidden;
  border-radius: 0 0 8px 8px;
`;

const ImageScrollView = styled(ScrollView)`
  overflow: hidden;
`;

const ImageWrapper = styled(View)<{ isDesktop: boolean }>`
  width: ${({ isDesktop }) => (isDesktop ? '600px' : 'calc(100vw - 48px)')};
  justify-content: center;
  align-items: center;
`;

const PageIndicatorContainer = styled(View)`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 4px;
`;

const PageDotButton = styled(TouchableOpacity)`
  padding: 4px;
`;

const PageDot = styled(View)<{ active: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: ${({ active }) => (active ? color.white : color.gray60)};
`;
