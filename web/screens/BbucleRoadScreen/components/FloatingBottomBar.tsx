import React, { useCallback } from 'react';
import { View, Text } from 'react-native';
import styled from 'styled-components/native';

import { color } from '@/constant/color';
import { SccPressable } from '@/components/SccPressable';
import IcThumbsUp from '@/assets/icon/ic_thumbs_up.svg';
import IcThumbsUpFill from '@/assets/icon/ic_thumbs_up_fill.svg';
import IcShare from '@/assets/icon/ic_share.svg';
import { useResponsive } from '../context/ResponsiveContext';
import { useEditMode } from '../context/EditModeContext';

interface FloatingBottomBarProps {
  likeCount: number;
  isLiked?: boolean;
  ctaButtonUrl: string;
  onLikePress?: () => void;
  onSharePress?: () => void;
}

export default function FloatingBottomBar({
  likeCount,
  isLiked,
  ctaButtonUrl,
  onLikePress,
  onSharePress,
}: FloatingBottomBarProps) {
  const { isDesktop } = useResponsive();
  const editContext = useEditMode();
  const isEditMode = editContext?.isEditMode ?? false;

  const handleSharePress = useCallback(() => {
    if (onSharePress) {
      onSharePress();
    } else if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: document.title,
        url: window.location.href,
      }).catch(() => {
        // User cancelled or share failed
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard?.writeText(window.location.href);
    }
  }, [onSharePress]);

  const handleCTAPress = useCallback(() => {
    if (typeof window !== 'undefined' && ctaButtonUrl) {
      window.open(ctaButtonUrl, '_blank');
    }
  }, [ctaButtonUrl]);

  const handleLikePress = useCallback(() => {
    onLikePress?.();
  }, [onLikePress]);

  return (
    <Container isDesktop={isDesktop}>
      <ContentWrapper isDesktop={isDesktop}>
        {/* Like Button */}
        <SccPressable
          onPress={handleLikePress}
          elementName="bbucle-road-floating-like"
          logParams={{ likeCount, isDesktop }}
          disableLogging={isEditMode}
        >
          <LikeButton isDesktop={isDesktop}>
            {isLiked ? (
              <IcThumbsUpFill width={20} height={20} viewBox="0 0 16 16" />
            ) : (
              <IcThumbsUp width={20} height={20} viewBox="0 0 17 16" color="#232328" />
            )}
            <LikeCount isDesktop={isDesktop}>{likeCount}</LikeCount>
          </LikeButton>
        </SccPressable>

        {/* Right Buttons */}
        <RightButtonsContainer>
          {/* Share Button */}
          <SccPressable
            onPress={handleSharePress}
            elementName="bbucle-road-floating-share"
            logParams={{ isDesktop }}
            disableLogging={isEditMode}
          >
            <ShareButton isDesktop={isDesktop}>
              <IcShare width={20} height={20} viewBox="0 0 20 20" color="#16181C" />
              <ShareButtonText isDesktop={isDesktop}>공유하기</ShareButtonText>
            </ShareButton>
          </SccPressable>

          {/* CTA Button */}
          <SccPressable
            onPress={handleCTAPress}
            elementName="bbucle-road-floating-cta"
            logParams={{ ctaButtonUrl, isDesktop }}
            disableLogging={isEditMode}
          >
            <CTAButton isDesktop={isDesktop}>
              <CTAButtonText isDesktop={isDesktop}>휠체어석 정보 신청</CTAButtonText>
            </CTAButton>
          </SccPressable>
        </RightButtonsContainer>
      </ContentWrapper>
    </Container>
  );
}

const Container = styled(View)<{ isDesktop: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 200;
  background-color: ${color.white};
  border-top-width: 1px;
  border-top-color: #dedee3;
  padding-top: ${({ isDesktop }) => (isDesktop ? '16px' : '10px')};
  padding-bottom: ${({ isDesktop }) => (isDesktop ? '32px' : '32px')};
  padding-horizontal: ${({ isDesktop }) => (isDesktop ? '24px' : '16px')};
`;

const ContentWrapper = styled(View)<{ isDesktop: boolean }>`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  max-width: 1020px;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
`;

const LikeButton = styled(View)<{ isDesktop: boolean }>`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${({ isDesktop }) => (isDesktop ? '7px' : '5px')};
  padding-horizontal: ${({ isDesktop }) => (isDesktop ? '15px' : '10px')};
  padding-vertical: ${({ isDesktop }) => (isDesktop ? '19px' : '13px')};
  border-radius: 4px;
  border-width: 1px;
  border-color: #d8d8df;
`;

const LikeCount = styled(Text)<{ isDesktop: boolean }>`
  font-family: Pretendard;
  font-size: ${({ isDesktop }) => (isDesktop ? '20px' : '16px')};
  line-height: ${({ isDesktop }) => (isDesktop ? '20px' : '20px')};
  font-weight: 500;
  color: #232328;
`;

const RightButtonsContainer = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const ShareButton = styled(View)<{ isDesktop: boolean }>`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding-left: ${({ isDesktop }) => (isDesktop ? '28px' : '20px')};
  padding-right: ${({ isDesktop }) => (isDesktop ? '32px' : '22px')};
  padding-vertical: ${({ isDesktop }) => (isDesktop ? '16px' : '13px')};
  border-radius: 4px;
  border-width: 1px;
  border-color: #d8d8df;
  background-color: ${color.white};
`;

const ShareButtonText = styled(Text)<{ isDesktop: boolean }>`
  font-family: Pretendard;
  font-size: ${({ isDesktop }) => (isDesktop ? '18px' : '14px')};
  line-height: ${({ isDesktop }) => (isDesktop ? '26px' : '20px')};
  font-weight: 500;
  color: #16181c;
`;

const CTAButton = styled(View)<{ isDesktop: boolean }>`
  padding-horizontal: ${({ isDesktop }) => (isDesktop ? '32px' : '20px')};
  padding-vertical: ${({ isDesktop }) => (isDesktop ? '17px' : '13px')};
  border-radius: 4px;
  background-color: #16181c;
  align-items: center;
  justify-content: center;
`;

const CTAButtonText = styled(Text)<{ isDesktop: boolean }>`
  font-family: Pretendard;
  font-size: ${({ isDesktop }) => (isDesktop ? '18px' : '15px')};
  line-height: ${({ isDesktop }) => (isDesktop ? '26px' : '22px')};
  font-weight: 700;
  color: #b8ff55;
`;
