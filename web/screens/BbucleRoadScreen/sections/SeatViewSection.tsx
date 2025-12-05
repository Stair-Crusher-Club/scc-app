import React, { useCallback, useState } from 'react';
import { View, Text, TextInput, Image } from 'react-native';
import styled from 'styled-components/native';

import type { BbucleRoadClickableRegionDto } from '@/generated-sources/openapi';
import { color } from '@/constant/color';
import HtmlContentWrapper from '../components/HtmlContentWrapper';
import ImageUploader from '../components/ImageUploader';
import InteractiveImage from '../components/InteractiveImage';
import RegionDetailModal from '../components/RegionDetailModal';
import { useEditMode } from '../context/EditModeContext';
import { useResponsive } from '../context/ResponsiveContext';
import type { SeatViewSectionData } from '../config/bbucleRoadData';

interface SeatViewSectionProps {
  seatViewSection: SeatViewSectionData;
  sectionId?: string;
}

export default function SeatViewSection({
  seatViewSection,
  sectionId,
}: SeatViewSectionProps) {
  const editContext = useEditMode();
  const isEditMode = editContext?.isEditMode ?? false;
  const { isDesktop } = useResponsive();

  const [selectedRegion, setSelectedRegion] =
    useState<BbucleRoadClickableRegionDto | null>(null);

  const { titleLine1, titleLine2, descriptionHtmls, interactiveImage } = seatViewSection;

  const updateSeatViewSection = useCallback(
    (updates: Partial<SeatViewSectionData>) => {
      if (!editContext) return;
      editContext.updateData((prev) => ({
        ...prev,
        seatViewSection: prev.seatViewSection
          ? { ...prev.seatViewSection, ...updates }
          : null,
      }));
    },
    [editContext],
  );

  const handleTitleLine1Change = useCallback(
    (text: string) => {
      updateSeatViewSection({ titleLine1: text });
    },
    [updateSeatViewSection],
  );

  const handleTitleLine2Change = useCallback(
    (text: string) => {
      updateSeatViewSection({ titleLine2: text });
    },
    [updateSeatViewSection],
  );

  const handleInteractiveImageChange = useCallback(
    (url: string) => {
      updateSeatViewSection({
        interactiveImage: {
          url,
          clickableRegions: interactiveImage?.clickableRegions || [],
        },
      });
    },
    [interactiveImage, updateSeatViewSection],
  );

  const handleRegionPress = useCallback(
    (region: BbucleRoadClickableRegionDto) => {
      // 데스크톱에서만 모달 표시
      if (isDesktop) {
        setSelectedRegion(region);
      }
    },
    [isDesktop],
  );

  const handleCloseModal = useCallback(() => {
    setSelectedRegion(null);
  }, []);

  // 모바일용: 모든 region의 modalImageUrls를 하나의 배열로 합침
  const allModalImages = interactiveImage?.clickableRegions?.flatMap(
    (region) => region.modalImageUrls || [],
  ) || [];

  return (
    <div id={sectionId}>
      <Container isDesktop={isDesktop}>
        <ContentWrapper isDesktop={isDesktop}>
          <TitleSection>
            {isEditMode ? (
              <>
                <TitleLine1Input
                  value={titleLine1}
                  onChangeText={handleTitleLine1Change}
                  placeholder="타이틀 1줄 (검정)"
                  placeholderTextColor={color.gray40}
                  isDesktop={isDesktop}
                />
                <TitleLine2Input
                  value={titleLine2}
                  onChangeText={handleTitleLine2Change}
                  placeholder="타이틀 2줄 (파랑)"
                  placeholderTextColor={color.gray40}
                  isDesktop={isDesktop}
                />
              </>
            ) : (
              <>
                <TitleLine1 isDesktop={isDesktop}>{titleLine1}</TitleLine1>
                <TitleLine2 isDesktop={isDesktop}>{titleLine2}</TitleLine2>
              </>
            )}
          </TitleSection>

          {/* Interactive 지도 이미지 */}
          {interactiveImage?.url ? (
            <ImageContainer isDesktop={isDesktop}>
              <InteractiveImage
                interactiveImage={interactiveImage}
                onRegionPress={handleRegionPress}
                onImageChange={isEditMode ? handleInteractiveImageChange : undefined}
                routeIndex={0}
                sectionType="seatView"
              />
            </ImageContainer>
          ) : (
            isEditMode && (
              <EmptyImagePlaceholder>
                <EmptyImageText>경기장 지도 이미지를 업로드하세요</EmptyImageText>
                <ImageUploader
                  onUploadComplete={handleInteractiveImageChange}
                  buttonText="이미지 업로드"
                />
              </EmptyImagePlaceholder>
            )
          )}

          {/* Description HTML 그리드 */}
          {descriptionHtmls && descriptionHtmls.length > 0 && (
            <DescriptionGrid isDesktop={isDesktop}>
              {descriptionHtmls.map((html, index) => (
                <DescriptionItem key={index} isDesktop={isDesktop}>
                  <HtmlContentWrapper isDesktop={isDesktop}>
                    <div dangerouslySetInnerHTML={{ __html: html }} />
                  </HtmlContentWrapper>
                </DescriptionItem>
              ))}
            </DescriptionGrid>
          )}

          {/* 모바일: modalImageUrls 이미지들 직접 표시 */}
          {!isDesktop && allModalImages.length > 0 && (
            <RegionImagesContainer>
              {allModalImages.map((imageUrl, index) => (
                <RegionImageWrapper key={index}>
                  <RegionImage
                    source={{ uri: imageUrl }}
                    resizeMode="contain"
                  />
                </RegionImageWrapper>
              ))}
            </RegionImagesContainer>
          )}
        </ContentWrapper>
      </Container>

      {/* Region Detail Modal - 데스크톱에서만 사용 */}
      {isDesktop && (
        <RegionDetailModal
          region={selectedRegion}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

const Container = styled(View)<{ isDesktop: boolean }>`
  padding-top: ${({ isDesktop }) => (isDesktop ? '120px' : '60px')};
  padding-bottom: ${({ isDesktop }) => (isDesktop ? '120px' : '60px')};
  width: 100%;
`;

const ContentWrapper = styled(View)<{ isDesktop: boolean }>`
  align-items: center;
  gap: ${({ isDesktop }) => (isDesktop ? '60px' : '32px')};
  width: 100%;
  padding: 0 16px;
`;

const TitleSection = styled(View)`
  align-items: center;
  gap: 0;
  max-width: 800px;
  width: 100%;
  padding: 0 16px;
`;

const TitleLine1 = styled(Text)<{ isDesktop: boolean }>`
  font-family: Pretendard;
  font-size: ${({ isDesktop }) => (isDesktop ? '40px' : '24px')};
  font-weight: 700;
  color: ${color.black};
  text-align: center;
  line-height: ${({ isDesktop }) => (isDesktop ? '54px' : '34px')};
`;

const TitleLine2 = styled(Text)<{ isDesktop: boolean }>`
  font-family: Pretendard;
  font-size: ${({ isDesktop }) => (isDesktop ? '40px' : '24px')};
  font-weight: 700;
  color: #0e64d3;
  text-align: center;
  line-height: ${({ isDesktop }) => (isDesktop ? '54px' : '34px')};
`;

const TitleLine1Input = styled(TextInput)<{ isDesktop: boolean }>`
  font-family: Pretendard;
  font-size: ${({ isDesktop }) => (isDesktop ? '40px' : '24px')};
  font-weight: 700;
  color: ${color.black};
  text-align: center;
  width: 100%;
`;

const TitleLine2Input = styled(TextInput)<{ isDesktop: boolean }>`
  font-family: Pretendard;
  font-size: ${({ isDesktop }) => (isDesktop ? '40px' : '24px')};
  font-weight: 700;
  color: #0e64d3;
  text-align: center;
  width: 100%;
`;

const DescriptionGrid = styled(View)<{ isDesktop: boolean }>`
  flex-direction: ${({ isDesktop }) => (isDesktop ? 'row' : 'column')};
  flex-wrap: wrap;
  gap: ${({ isDesktop }) => (isDesktop ? '60px' : '24px')};;
  max-width: 1020px;
  width: 100%;
`;

const DescriptionItem = styled(View)<{ isDesktop: boolean }>`
  flex: 1;
  flex-basis: ${({ isDesktop }) => (isDesktop ? '45%' : '100%')};
`;

const ImageContainer = styled(View)<{ isDesktop: boolean }>`
  max-width: 1020px;
  width: ${({ isDesktop }) => (isDesktop ? '100%' : 'calc(100% + 32px)')};
  margin-horizontal: ${({ isDesktop }) => (isDesktop ? '0' : '-16px')};
  position: relative;
`;

const EmptyImagePlaceholder = styled(View)`
  max-width: 1020px;
  width: 100%;
  padding: 60px;
  background-color: ${color.white};
  border: 2px dashed ${color.gray25};
  border-radius: 12px;
  align-items: center;
  gap: 16px;
`;

const EmptyImageText = styled(Text)`
  font-size: 16px;
  color: ${color.gray60};
`;

/* 모바일: Region 이미지 직접 표시 */
const RegionImagesContainer = styled(View)`
  width: 100%;
  margin-horizontal: 16px;
  gap: 12px;
`;

const RegionImageWrapper = styled(View)`
  width: 100%;
  overflow: hidden;
`;

const RegionImage = styled(Image)`
  width: 100%;
  aspect-ratio: 1.78;
`;
