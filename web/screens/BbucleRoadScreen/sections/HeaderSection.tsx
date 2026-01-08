import React, { useCallback, useEffect } from 'react';
import { View, Text, TextInput } from 'react-native';
import styled from 'styled-components/native';

import SccRemoteImage from '@/components/SccRemoteImage';
import CharacterWheelyIcon from '@/assets/icon/character_wheely.svg';
import { color } from '@/constant/color';
import Logger from '@/logging/Logger';
import { useEditMode } from '../context/EditModeContext';
import { useResponsive } from '../context/ResponsiveContext';
import ImageUploader from '../components/ImageUploader';

interface HeaderSectionProps {
  titleImageUrl: string;
  mobileTitleImageUrl?: string;
  headerBackgroundImageUrl?: string;
  mobileHeaderBackgroundImageUrl?: string;
  headerImageCaption?: string;
  lastUpdatedDate?: string;
  wheelchairUserCommentHtml?: string;
  wheelchairUserCommentHtmlMobile?: string;
  /** 타이틀 이미지 너비 (데스크탑, 기본값: 487px) */
  titleImageWidth?: number;
  /** 모바일 타이틀 이미지 너비 (기본값: 280px) */
  mobileTitleImageWidth?: number;
  /** 휠체어 사용자의 한마디 라벨 */
  wheelchairUserCommentLabel?: string;
}

export default function HeaderSection({
  titleImageUrl,
  mobileTitleImageUrl,
  headerBackgroundImageUrl,
  mobileHeaderBackgroundImageUrl,
  headerImageCaption,
  lastUpdatedDate,
  wheelchairUserCommentHtml,
  wheelchairUserCommentHtmlMobile,
  titleImageWidth,
  mobileTitleImageWidth,
  wheelchairUserCommentLabel,
}: HeaderSectionProps) {
  const editContext = useEditMode();
  const isEditMode = editContext?.isEditMode ?? false;
  const { isDesktop } = useResponsive();

  // edit mode에서는 editContext.data에서 읽어야 실시간 반영됨
  const currentHeaderBackgroundImageUrl = isEditMode
    ? editContext?.data?.headerBackgroundImageUrl
    : headerBackgroundImageUrl;
  const currentMobileHeaderBackgroundImageUrl = isEditMode
    ? editContext?.data?.mobileHeaderBackgroundImageUrl
    : mobileHeaderBackgroundImageUrl;
  const currentMobileTitleImageUrl = isEditMode
    ? editContext?.data?.mobileTitleImageUrl
    : mobileTitleImageUrl;

  // 데스크탑이 아니면 모바일 이미지 우선 사용
  const displayBackgroundImageUrl = isDesktop
    ? currentHeaderBackgroundImageUrl
    : (currentMobileHeaderBackgroundImageUrl || currentHeaderBackgroundImageUrl);
  const displayTitleImageUrl = isDesktop
    ? titleImageUrl
    : (currentMobileTitleImageUrl || titleImageUrl);
  const currentLastUpdatedDate = isEditMode
    ? editContext?.data?.lastUpdatedDate
    : lastUpdatedDate;
  const currentWheelchairUserCommentHtml = isEditMode
    ? editContext?.data?.wheelchairUserCommentHtml
    : wheelchairUserCommentHtml;
  const currentWheelchairUserCommentHtmlMobile = isEditMode
    ? editContext?.data?.wheelchairUserCommentHtmlMobile
    : wheelchairUserCommentHtmlMobile;

  // 데스크탑이 아니면 모바일 HTML 우선 사용
  const displayWheelchairUserCommentHtml = isDesktop
    ? currentWheelchairUserCommentHtml
    : (currentWheelchairUserCommentHtmlMobile || currentWheelchairUserCommentHtml);

  const currentHeaderImageCaption = isEditMode
    ? editContext?.data?.headerImageCaption
    : headerImageCaption;

  const handleTitleImageChange = useCallback(
    (url: string) => {
      if (!editContext) return;
      editContext.updateData((prev) => ({
        ...prev,
        titleImageUrl: url,
      }));
    },
    [editContext],
  );

  const handleBackgroundImageChange = useCallback(
    (url: string) => {
      if (!editContext) return;
      editContext.updateData((prev) => ({
        ...prev,
        headerBackgroundImageUrl: url,
      }));
    },
    [editContext],
  );

  const handleLastUpdatedDateChange = useCallback(
    (text: string) => {
      if (!editContext) return;
      editContext.updateData((prev) => ({
        ...prev,
        lastUpdatedDate: text,
      }));
    },
    [editContext],
  );

  // 이미지 노출 로깅
  useEffect(() => {
    if (!isEditMode && displayBackgroundImageUrl) {
      Logger.logElementView({
        name: 'bbucle-road-header-background-image',
        currScreenName: 'BbucleRoad',
        extraParams: { imageUrl: displayBackgroundImageUrl, isDesktop },
      });
    }
  }, [displayBackgroundImageUrl, isEditMode, isDesktop]);

  useEffect(() => {
    if (!isEditMode && displayTitleImageUrl) {
      Logger.logElementView({
        name: 'bbucle-road-header-title-image',
        currScreenName: 'BbucleRoad',
        extraParams: { imageUrl: displayTitleImageUrl, isDesktop },
      });
    }
  }, [displayTitleImageUrl, isEditMode, isDesktop]);

  return (
    <Container isDesktop={isDesktop}>
      {/* 배경 이미지 + 오버레이 */}
      {displayBackgroundImageUrl && (
        <>
          <BackgroundWrapper>
            <SccRemoteImage
              imageUrl={displayBackgroundImageUrl}
              resizeMode="cover"
              style={{ width: '100%', height: '100%' }}
              wrapperBackgroundColor={null}
            />
          </BackgroundWrapper>
          <BackgroundOverlay />
        </>
      )}

      {/* 배경 이미지 캡션 */}
      {currentHeaderImageCaption && (
        <ImageCaptionWrapper isDesktop={isDesktop}>
          <ImageCaptionText isDesktop={isDesktop}>
            {currentHeaderImageCaption}
          </ImageCaptionText>
        </ImageCaptionWrapper>
      )}

      {/* Edit Mode: 배경 이미지 교체 버튼 */}
      {isEditMode && (
        <BackgroundEditOverlay>
          <ImageUploader
            currentImageUrl={currentHeaderBackgroundImageUrl}
            onUploadComplete={handleBackgroundImageChange}
            compact
          />
        </BackgroundEditOverlay>
      )}

      <ContentWrapper isDesktop={isDesktop}>
        {/* 뿌클로드 특별 기획 */}
        <SubTitle isDesktop={isDesktop}>뿌클로드 특별 기획</SubTitle>

        {/* 타이틀 이미지 */}
        <TitleImageWrapper
          isDesktop={isDesktop}
          customWidth={isDesktop ? titleImageWidth : mobileTitleImageWidth}
        >
          {isEditMode && (
            <EditImageOverlay>
              <ImageUploader
                currentImageUrl={titleImageUrl}
                onUploadComplete={handleTitleImageChange}
                compact
              />
            </EditImageOverlay>
          )}
          {displayTitleImageUrl ? (
            <SccRemoteImage
              imageUrl={displayTitleImageUrl}
              resizeMode="contain"
              wrapperBackgroundColor={null}
            />
          ) : (
            isEditMode && (
              <EmptyImagePlaceholder>
                <EmptyImageText>타이틀 이미지를 업로드하세요</EmptyImageText>
              </EmptyImagePlaceholder>
            )
          )}
        </TitleImageWrapper>

        {/* 최종 업데이트 날짜 */}
        {isEditMode ? (
          <UpdateDateBadge isDesktop={isDesktop}>
            <UpdateDateInput
              value={currentLastUpdatedDate || ''}
              onChangeText={handleLastUpdatedDateChange}
              placeholder="최종 업데이트 YYYY.MM.DD"
              placeholderTextColor={color.gray40}
            />
          </UpdateDateBadge>
        ) : (
          currentLastUpdatedDate && (
            <UpdateDateBadge isDesktop={isDesktop}>
              <UpdateDateText isDesktop={isDesktop}>{currentLastUpdatedDate}</UpdateDateText>
            </UpdateDateBadge>
          )
        )}

        {/* 휠체어 사용자의 한마디 섹션 */}
        <CommentSection isDesktop={isDesktop}>
          <CommentLabel isDesktop={isDesktop}>
            {wheelchairUserCommentLabel || '휠체어 사용자의 고척돔 접근성 한마디'}
          </CommentLabel>
          <SpeechBubbleWithCharacter>
            <SpeechBubbleWrapper isDesktop={isDesktop}>
              <SpeechBubble isDesktop={isDesktop}>
                {displayWheelchairUserCommentHtml ? (
                  <CommentHtmlWrapper isDesktop={isDesktop}>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: displayWheelchairUserCommentHtml,
                      }}
                    />
                  </CommentHtmlWrapper>
                ) : (
                  isEditMode && (
                    <EmptyCommentPlaceholder>
                      사이드바에서 접근성 한마디를 입력하세요
                    </EmptyCommentPlaceholder>
                  )
                )}
              </SpeechBubble>
              <SpeechBubbleTail />
            </SpeechBubbleWrapper>
            <CharacterWrapper isDesktop={isDesktop}>
              <CharacterWheelyIcon
                width={isDesktop ? 89 : 60}
                height={isDesktop ? 86 : 58}
                viewBox="0 0 89 86"
              />
            </CharacterWrapper>
          </SpeechBubbleWithCharacter>
        </CommentSection>
      </ContentWrapper>
    </Container>
  );
}

const Container = styled(View)<{ isDesktop: boolean }>`
  position: relative;
  background-color: #b2d7ff;
  overflow: hidden;
`;

const BackgroundWrapper = styled(View)`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const BackgroundOverlay = styled(View)`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.4);
`;

const ImageCaptionWrapper = styled(View)<{ isDesktop: boolean }>`
  position: absolute;
  bottom: ${({ isDesktop }) => (isDesktop ? '20px' : '16px')};
  right: ${({ isDesktop }) => (isDesktop ? '24px' : '16px')};
  z-index: 2;
`;

const ImageCaptionText = styled(Text)<{ isDesktop: boolean }>`
  font-family: Pretendard;
  font-size: ${({ isDesktop }) => (isDesktop ? '13px' : '12px')};
  line-height: ${({ isDesktop }) => (isDesktop ? '18px' : '16px')};
  font-weight: 400;
  color: ${color.gray35};
`;

const BackgroundEditOverlay = styled(View)`
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
`;

const ContentWrapper = styled(View)<{ isDesktop: boolean }>`
  align-items: center;
  padding-top: ${({ isDesktop }) => (isDesktop ? '119px' : '80px')};
  z-index: 1;
`;

const SubTitle = styled(Text)<{ isDesktop: boolean }>`
  font-family: Pretendard;
  font-size: ${({ isDesktop }) => (isDesktop ? '24px' : '20px')};
  font-weight: 700;
  line-height: ${({ isDesktop }) => (isDesktop ? '32px' : '28px')};
  color: ${color.white};
  text-align: center;
  margin-bottom: 12px;
`;

const TitleImageWrapper = styled(View)<{ isDesktop: boolean; customWidth?: number }>`
  position: relative;
  width: ${({ isDesktop, customWidth }) =>
    customWidth ? `${customWidth}px` : (isDesktop ? '487px' : '280px')};
`;

const EditImageOverlay = styled(View)`
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
`;

const EmptyImagePlaceholder = styled(View)`
  flex: 1;
  padding: 40px;
  background-color: rgba(255, 255, 255, 0.2);
  border: 2px dashed rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  align-items: center;
  justify-content: center;
`;

const EmptyImageText = styled(Text)`
  font-size: 14px;
  color: ${color.white};
`;

const UpdateDateBadge = styled(View)<{ isDesktop: boolean }>`
  flex-direction: row;
  align-items: center;
  background-color: ${color.black};
  padding: ${({ isDesktop }) => (isDesktop ? '4px 16px' : '3px 14px')};
  border-radius: 100px;
  margin-top: 12px;
  margin-bottom: ${({ isDesktop }) => (isDesktop ? '60px' : '40px')};
`;

const UpdateDateText = styled(Text)<{ isDesktop: boolean }>`
  font-family: Pretendard;
  font-size: ${({ isDesktop }) => (isDesktop ? '16px' : '14px')};
  font-weight: 500;
  line-height: ${({ isDesktop }) => (isDesktop ? '24px' : '18px')};
  color: ${color.white};
`;

const UpdateDateInput = styled(TextInput)`
  font-family: Pretendard;
  font-size: 14px;
  font-weight: 500;
  color: ${color.white};
  min-width: 80px;
  padding: 0;
`;

const CommentSection = styled(View)<{ isDesktop: boolean }>`
  align-items: center;
  gap: 12px;
  max-width: ${({ isDesktop }) => (isDesktop ? '600px' : '90%')};
`;

const CommentLabel = styled(Text)<{ isDesktop: boolean }>`
  font-family: ${({ isDesktop }) => (isDesktop ? 'Pretendard-Bold' : 'Pretendard')};;
  font-size: ${({ isDesktop }) => (isDesktop ? '18px' : '18px')};
  line-height: ${({ isDesktop }) => (isDesktop ? '26px' : '26px')};
  letter-spacing: -0.36px;
  color: ${color.white};
  text-align: center;
`;

const SpeechBubbleWrapper = styled(View)<{ isDesktop: boolean }>`
  width: ${({ isDesktop }) => (isDesktop ? '537px' : '308px')};
`;

const SpeechBubble = styled(View)<{ isDesktop: boolean }>`
  background-color: ${color.white};
  padding: ${({ isDesktop }) => (isDesktop ? '14px 16px' : '12px 14px')};
  border-radius: 12px;
`;

const SpeechBubbleTail = styled(View)`
  width: 0;
  height: 0;
  border-left-width: 10px;
  border-right-width: 10px;
  border-top-width: 12px;
  border-left-color: transparent;
  border-right-color: transparent;
  border-top-color: ${color.white};
  margin-left: 40px;
`;

const CommentHtmlWrapper = styled(View)<{ isDesktop: boolean }>`
  font-family: Pretendard;
  font-size: ${({ isDesktop }) => (isDesktop ? '16px' : '14px')};
  font-weight: 400;
  line-height: ${({ isDesktop }) => (isDesktop ? '24px' : '22px')};
  letter-spacing: -0.75px;
  color: ${color.black};
`;

const EmptyCommentPlaceholder = styled(Text)`
  font-family: Pretendard;
  font-size: 14px;
  color: ${color.gray40};
`;

const SpeechBubbleWithCharacter = styled(View)`
  align-items: flex-start;
`;

const CharacterWrapper = styled(View)<{ isDesktop: boolean }>`
  margin-top: 16px;
  margin-left: ${({ isDesktop }) => (isDesktop ? '-10px' : '10px')};
`;

