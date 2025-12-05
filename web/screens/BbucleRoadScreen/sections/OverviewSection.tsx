import React, { useCallback } from 'react';
import { View, Text, TextInput } from 'react-native';
import styled from 'styled-components/native';

import SccRemoteImage from '@/components/SccRemoteImage';
import { color } from '@/constant/color';
import ImageUploader from '../components/ImageUploader';
import { useEditMode } from '../context/EditModeContext';
import { useResponsive } from '../context/ResponsiveContext';
import type { OverviewSectionData } from '../config/bbucleRoadData';

interface OverviewSectionProps {
  overviewSection: OverviewSectionData;
  sectionId?: string;
}

export default function OverviewSection({
  overviewSection,
  sectionId,
}: OverviewSectionProps) {
  const editContext = useEditMode();
  const isEditMode = editContext?.isEditMode ?? false;
  const { isDesktop } = useResponsive();

  const { titleLine1, titleLine2, mapImageUrl } = overviewSection;

  const updateOverviewSection = useCallback(
    (updates: Partial<OverviewSectionData>) => {
      if (!editContext) return;
      editContext.updateData((prev) => ({
        ...prev,
        overviewSection: prev.overviewSection
          ? { ...prev.overviewSection, ...updates }
          : null,
      }));
    },
    [editContext],
  );

  const handleTitleLine1Change = useCallback(
    (text: string) => {
      updateOverviewSection({ titleLine1: text });
    },
    [updateOverviewSection],
  );

  const handleTitleLine2Change = useCallback(
    (text: string) => {
      updateOverviewSection({ titleLine2: text });
    },
    [updateOverviewSection],
  );

  const handleMapImageChange = useCallback(
    (url: string) => {
      updateOverviewSection({ mapImageUrl: url });
    },
    [updateOverviewSection],
  );

  return (
    <div id={sectionId}>
      <Container>
        <ContentWrapper>
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

          {/* 지도 이미지 */}
          {mapImageUrl ? (
            <ImageContainer>
              <SccRemoteImage
                imageUrl={mapImageUrl}
                resizeMode="contain"
                style={{ borderRadius: 12 }}
                wrapperBackgroundColor="white"
              />
              {isEditMode && (
                <ImageOverlay>
                  <ImageUploader
                    currentImageUrl={mapImageUrl}
                    onUploadComplete={handleMapImageChange}
                    compact
                  />
                </ImageOverlay>
              )}
            </ImageContainer>
          ) : (
            isEditMode && (
              <EmptyImagePlaceholder>
                <EmptyImageText>지도 이미지를 업로드하세요</EmptyImageText>
                <ImageUploader
                  onUploadComplete={handleMapImageChange}
                  buttonText="이미지 업로드"
                />
              </EmptyImagePlaceholder>
            )
          )}
        </ContentWrapper>
      </Container>
    </div>
  );
}

const Container = styled(View)`
  padding-top: 60px;
  padding-bottom: 80px;
  width: 100%;
`;

const ContentWrapper = styled(View)`
  align-items: center;
  gap: 40px;
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

const ImageContainer = styled(View)`
  max-width: 1020px;
  width: 100%;
  position: relative;
`;

const ImageOverlay = styled(View)`
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
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
