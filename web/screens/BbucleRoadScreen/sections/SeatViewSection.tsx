import React, { useCallback, useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import styled from 'styled-components/native';

import SccRemoteImage from '@/components/SccRemoteImage';
import { color } from '@/constant/color';
import { LogParamsProvider } from '@/logging/LogParamsProvider';
import HtmlContentWrapper from '../components/HtmlContentWrapper';
import ImageUploader from '../components/ImageUploader';
import InteractiveImage from '../components/InteractiveImage';
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

  const { titleLine1, titleLine2, descriptionHtmls, interactiveImage, mobileImageUrl, noticeBox } = seatViewSection;

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

  const handleMobileImageChange = useCallback(
    (url: string) => {
      updateSeatViewSection({ mobileImageUrl: url });
    },
    [updateSeatViewSection],
  );

  // 모바일 + 정적 이미지용: 모든 region의 modalImageUrls를 하나의 배열로 합침 (모바일 URL 우선)
  const allModalImages = interactiveImage?.clickableRegions?.flatMap(
    (region) => region.mobileModalImageUrls?.length
      ? region.mobileModalImageUrls
      : region.modalImageUrls || [],
  ) || [];

  return (
    <LogParamsProvider params={{ displaySectionName: '시야정보' }}>
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
          {/* 모바일에서 mobileImageUrl이 있으면 정적 이미지 표시 */}
          {!isDesktop && mobileImageUrl ? (
            <ImageContainer isDesktop={isDesktop}>
              <SccRemoteImage
                imageUrl={mobileImageUrl}
                resizeMode="contain"
                wrapperBackgroundColor={null}
              />
              {/* 제보 알림 박스 */}
              {noticeBox && (
                <NoticeBoxContainer isDesktop={isDesktop}>
                  <NoticeBoxTitleRow>
                    {noticeBox.title.startsWith('📢') && (
                      <NoticeBoxEmoji>📢</NoticeBoxEmoji>
                    )}
                    <NoticeBoxTitle>
                      {noticeBox.title.startsWith('📢') ? noticeBox.title.slice(2).trim() : noticeBox.title}
                    </NoticeBoxTitle>
                  </NoticeBoxTitleRow>
                  <NoticeBoxDescription>
                    <HtmlContentWrapper isDesktop={isDesktop}>
                      <div dangerouslySetInnerHTML={{ __html: noticeBox.descriptionHtml }} />
                    </HtmlContentWrapper>
                  </NoticeBoxDescription>
                </NoticeBoxContainer>
              )}
              {isEditMode && (
                <MobileImageOverlay>
                  <ImageUploader
                    currentImageUrl={mobileImageUrl}
                    onUploadComplete={handleMobileImageChange}
                    compact
                  />
                </MobileImageOverlay>
              )}
            </ImageContainer>
          ) : interactiveImage?.url ? (
            <ImageContainer isDesktop={isDesktop}>
              <InteractiveImage
                interactiveImage={interactiveImage}
                onImageChange={isEditMode ? handleInteractiveImageChange : undefined}
                routeIndex={0}
                sectionType="seatView"
                hintTextBackgroundColor={color.brand5}
              />
              {/* 제보 알림 박스 */}
              {noticeBox && (
                <NoticeBoxContainer isDesktop={isDesktop}>
                  <NoticeBoxTitleRow>
                    {noticeBox.title.startsWith('📢') && (
                      <NoticeBoxEmoji>📢</NoticeBoxEmoji>
                    )}
                    <NoticeBoxTitle>
                      {noticeBox.title.startsWith('📢') ? noticeBox.title.slice(2).trim() : noticeBox.title}
                    </NoticeBoxTitle>
                  </NoticeBoxTitleRow>
                  <NoticeBoxDescription>
                    <HtmlContentWrapper isDesktop={isDesktop}>
                      <div dangerouslySetInnerHTML={{ __html: noticeBox.descriptionHtml }} />
                    </HtmlContentWrapper>
                  </NoticeBoxDescription>
                </NoticeBoxContainer>
              )}
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

          {/* Edit Mode: 모바일 이미지 관리 (데스크탑에서 편집 시) */}
          {isEditMode && isDesktop && (
            <MobileImageSection>
              <MobileImageLabel>모바일용 이미지 (선택사항)</MobileImageLabel>
              {mobileImageUrl ? (
                <MobileImagePreview>
                  <SccRemoteImage
                    imageUrl={mobileImageUrl}
                    resizeMode="contain"
                    style={{ borderRadius: 8, maxHeight: 200 }}
                    wrapperBackgroundColor={null}
                  />
                  <MobileImageActions>
                    <ImageUploader
                      currentImageUrl={mobileImageUrl}
                      onUploadComplete={handleMobileImageChange}
                      compact
                    />
                  </MobileImageActions>
                </MobileImagePreview>
              ) : (
                <ImageUploader
                  onUploadComplete={handleMobileImageChange}
                  buttonText="모바일 이미지 업로드"
                />
              )}
            </MobileImageSection>
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

          {/* 모바일 + 정적 이미지 사용 시: modalImageUrls 이미지들 직접 표시 */}
          {!isDesktop && mobileImageUrl && allModalImages.length > 0 && (
            <RegionImagesContainer>
              {allModalImages.map((imageUrl, index) => (
                <RegionImageWrapper key={index}>
                  <SccRemoteImage
                    imageUrl={imageUrl}
                    resizeMode="contain"
                    style={{ borderRadius: 8 }}
                    wrapperBackgroundColor={null}
                  />
                </RegionImageWrapper>
              ))}
            </RegionImagesContainer>
          )}
        </ContentWrapper>
      </Container>
    </div>
    </LogParamsProvider>
  );
}

const Container = styled(View)<{ isDesktop: boolean }>`
  padding-vertical: ${({ isDesktop }) => (isDesktop ? '140px' : '80px')};
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
  gap: ${({ isDesktop }) => (isDesktop ? '60px' : '32px')};
  max-width: 1020px;
  width: 100%;
`;

const DescriptionItem = styled(View)<{ isDesktop: boolean }>`
  flex: 1;
  flex-basis: ${({ isDesktop }) => (isDesktop ? '45%' : '100%')};
  width: ${({ isDesktop }) => (isDesktop ? 'auto' : '100%')};
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

/* 모바일 이미지 오버레이 (Edit Mode) */
const MobileImageOverlay = styled(View)`
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
`;

/* 모바일 이미지 관리 섹션 (데스크탑 Edit Mode) */
const MobileImageSection = styled(View)`
  max-width: 1020px;
  width: 100%;
  padding: 20px;
  background-color: ${color.gray10};
  border-radius: 12px;
  gap: 12px;
`;

const MobileImageLabel = styled(Text)`
  font-family: Pretendard;
  font-size: 14px;
  font-weight: 600;
  color: ${color.gray80};
`;

const MobileImagePreview = styled(View)`
  position: relative;
  max-width: 400px;
`;

const MobileImageActions = styled(View)`
  position: absolute;
  top: 8px;
  right: 8px;
`;

/* 제보 알림 박스 */
const NoticeBoxContainer = styled(View)<{ isDesktop: boolean }>`
  max-width: 1020px;
  margin-top: ${({ isDesktop }) => (isDesktop ? '12px' : '0')};
  background-color: rgba(184, 255, 85, 0.3);
  border-radius: ${({ isDesktop }) => (isDesktop ? '12px' : '0')};
  padding: 16px;
  gap: 6px;
`;

const NoticeBoxTitleRow = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const NoticeBoxEmoji = styled(Text)`
  font-family: Pretendard;
  font-size: 15px;
  font-weight: 700;
  line-height: 22px;
  color: ${color.brand50};
`;

const NoticeBoxTitle = styled(Text)`
  font-family: Pretendard;
  font-size: 15px;
  font-weight: 700;
  line-height: 22px;
  color: ${color.black};
`;

const NoticeBoxDescription = styled(View)`
  font-family: Pretendard;
  font-size: 15px;
  font-weight: 400;
  color: ${color.gray80};
  line-height: 24px;
`;
