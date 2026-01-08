import React, { useCallback } from 'react';
import { View, Text, TextInput } from 'react-native';
import styled from 'styled-components/native';

import SccPressable from '@/components/SccPressable';
import SccRemoteImage from '@/components/SccRemoteImage';
import { color } from '@/constant/color';
import { LogParamsProvider } from '@/logging/LogParamsProvider';
import HtmlContentWrapper from '../components/HtmlContentWrapper';
import ImageUploader from '../components/ImageUploader';
import { useEditMode } from '../context/EditModeContext';
import { useResponsive } from '../context/ResponsiveContext';
import type { TicketInfoSectionData } from '../config/bbucleRoadData';

interface TicketInfoSectionProps {
  ticketInfoSection: TicketInfoSectionData;
  sectionId?: string;
}

export default function TicketInfoSection({
  ticketInfoSection,
  sectionId,
}: TicketInfoSectionProps) {
  const editContext = useEditMode();
  const isEditMode = editContext?.isEditMode ?? false;
  const { isDesktop } = useResponsive();

  const { titleLine1, titleLine2, descriptionHtml, imageUrl, mobileImageUrl } =
    ticketInfoSection;

  // 데스크탑이 아니면 모바일 이미지 우선 사용
  const displayImageUrl = isDesktop ? imageUrl : (mobileImageUrl || imageUrl);

  const updateTicketInfoSection = useCallback(
    (updates: Partial<TicketInfoSectionData>) => {
      if (!editContext) return;
      editContext.updateData((prev) => ({
        ...prev,
        ticketInfoSection: prev.ticketInfoSection
          ? { ...prev.ticketInfoSection, ...updates }
          : null,
      }));
    },
    [editContext],
  );

  const handleTitleLine1Change = useCallback(
    (text: string) => {
      updateTicketInfoSection({ titleLine1: text });
    },
    [updateTicketInfoSection],
  );

  const handleTitleLine2Change = useCallback(
    (text: string) => {
      updateTicketInfoSection({ titleLine2: text });
    },
    [updateTicketInfoSection],
  );

  const handleImageChange = useCallback(
    (url: string) => {
      updateTicketInfoSection({ imageUrl: url });
    },
    [updateTicketInfoSection],
  );

  return (
    <LogParamsProvider params={{ displaySectionName: '매표정보' }}>
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

          {/* 설명 + 이미지 (Desktop: 좌우 배열) */}
          <ContentRow isDesktop={isDesktop}>
            {/* 설명 HTML */}
            {descriptionHtml && (
              <DescriptionWrapper isDesktop={isDesktop}>
                <HtmlContentWrapper isDesktop={isDesktop}>
                  <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
                </HtmlContentWrapper>
              </DescriptionWrapper>
            )}

            {/* 이미지 */}
            {displayImageUrl ? (
              <ImageContainer isDesktop={isDesktop}>
                <SccPressable
                  onPress={() => {}}
                  elementName="bbucle-road-ticket-info-image-click"
                  logParams={{ imageUrl: displayImageUrl }}
                  disableLogging={isEditMode}
                >
                  <SccRemoteImage
                    imageUrl={displayImageUrl}
                    resizeMode="contain"
                    style={{ borderRadius: 12 }}
                  />
                </SccPressable>
                {isEditMode && (
                  <ImageOverlay>
                    <ImageUploader
                      currentImageUrl={imageUrl}
                      onUploadComplete={handleImageChange}
                      compact
                    />
                  </ImageOverlay>
                )}
              </ImageContainer>
            ) : (
              isEditMode && (
                <EmptyImagePlaceholder isDesktop={isDesktop}>
                  <EmptyImageText>매표소 이미지를 업로드하세요</EmptyImageText>
                  <ImageUploader
                    onUploadComplete={handleImageChange}
                    buttonText="이미지 업로드"
                  />
                </EmptyImagePlaceholder>
              )
            )}
          </ContentRow>
        </ContentWrapper>
      </Container>
    </div>
    </LogParamsProvider>
  );
}

const Container = styled(View)<{ isDesktop: boolean }>`
  padding-vertical: ${({ isDesktop }) => (isDesktop ? '140px' : '80px')};
  width: 100%;
  background-color: ${color.gray10};
`;

const ContentWrapper = styled(View)<{ isDesktop: boolean }>`
  align-items: center;
  gap: ${({ isDesktop }) => (isDesktop ? '40px' : '24px')};
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

const ContentRow = styled(View)<{ isDesktop: boolean }>`
  flex-direction: ${({ isDesktop }) => (isDesktop ? 'row' : 'column-reverse')};
  gap: ${({ isDesktop }) => (isDesktop ? '30px' : '40px')};
  max-width: 1020px;
  width: 100%;
  align-items: ${({ isDesktop }) => (isDesktop ? 'flex-start' : 'center')};
`;

const DescriptionWrapper = styled(View)<{ isDesktop: boolean }>`
  flex: ${({ isDesktop }) => (isDesktop ? '2' : 'none')};
  width: ${({ isDesktop }) => (isDesktop ? 'auto' : '100%')};
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

const ImageContainer = styled(View)<{ isDesktop: boolean }>`
  flex: ${({ isDesktop }) => (isDesktop ? '3' : 'none')};
  width: ${({ isDesktop }) => (isDesktop ? 'auto' : 'calc(100% + 32px)')};
  margin-horizontal: ${({ isDesktop }) => (isDesktop ? '0' : '-16px')};
  position: relative;
`;

const ImageOverlay = styled(View)`
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
`;

const EmptyImagePlaceholder = styled(View)<{ isDesktop: boolean }>`
  flex: ${({ isDesktop }) => (isDesktop ? '1' : 'none')};
  width: ${({ isDesktop }) => (isDesktop ? 'auto' : '100%')};
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
