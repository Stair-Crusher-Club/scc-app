import React, { useCallback } from 'react';
import { View, Text } from 'react-native';
import styled from 'styled-components/native';

import { color } from '@/constant/color';
import { SccPressable } from '@/components/SccPressable';
import IcThumbsUp from '@/assets/icon/ic_thumbs_up.svg';
import IcThumbsUpFill from '@/assets/icon/ic_thumbs_up_fill.svg';
import IcShareWeb from '@/assets/icon/ic_share_web.svg';
import { useResponsive } from '../context/ResponsiveContext';
import { useEditMode } from '../context/EditModeContext';

interface FloatingBottomBarProps {
  title: string;
  likeCount: number;
  isLiked?: boolean;
  ctaButtonUrl: string;
  onLikePress?: () => void;
  onSharePress?: () => void;
}

export default function FloatingBottomBar({
  title,
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
    const shareText = `[${title}] 이동약자를 위한 진짜 리뷰를 뿌클로드에서 확인해보세요!\n${window.location.href}`
    if (onSharePress) {
      onSharePress();
    } else if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: document.title,
        text: shareText,
      }).catch(() => {
        // User cancelled or share failed
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard?.writeText(shareText);
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
      <ButtonsSection isDesktop={isDesktop}>
        <ContentWrapper isDesktop={isDesktop}>
          {/* Left Group: Like + Share */}
          <LeftButtonsContainer>
            {/* Like Button */}
            <SccPressable
              onPress={handleLikePress}
              elementName="bbucle-road-floating-like"
              logParams={{ likeCount, isDesktop }}
              disableLogging={isEditMode}
            >
              <LikeButton isDesktop={isDesktop}>
                {isLiked ? (
                  <IcThumbsUpFill width={isDesktop ? 24 : 20} height={isDesktop ? 24 : 20} viewBox="0 0 16 16" />
                ) : (
                  <IcThumbsUp width={isDesktop ? 24 : 20} height={isDesktop ? 24 : 20} viewBox="0 0 17 16" color="#232328" />
                )}
                <LikeCount isDesktop={isDesktop}>{likeCount}</LikeCount>
              </LikeButton>
            </SccPressable>

            {/* Share Button */}
            <SccPressable
              onPress={handleSharePress}
              elementName="bbucle-road-floating-share"
              logParams={{ isDesktop }}
              disableLogging={isEditMode}
            >
              <ShareButton isDesktop={isDesktop}>
                <IcShareWeb width={isDesktop ? 24 : 20} height={isDesktop ? 24 : 20} viewBox="0 0 24 24" color="#16181C" />
              </ShareButton>
            </SccPressable>
          </LeftButtonsContainer>

          {/* CTA Button with Tooltip */}
          <CTAWrapper>
            {isDesktop && (
              <TooltipContainer>
                <TooltipContent>
                  <TooltipText>정보가 더 필요한 장소가 있다면 요청해주세요! 🎯</TooltipText>
                </TooltipContent>
                <TooltipArrow />
              </TooltipContainer>
            )}
            <SccPressable
              onPress={handleCTAPress}
              elementName="bbucle-road-floating-cta"
              logParams={{ ctaButtonUrl, isDesktop }}
              disableLogging={isEditMode}
              style={{ flex: 1 }}
            >
              <CTAButton isDesktop={isDesktop}>
                <CTAButtonText isDesktop={isDesktop}>정보 요청하기!</CTAButtonText>
              </CTAButton>
            </SccPressable>
          </CTAWrapper>
        </ContentWrapper>
      </ButtonsSection>

      {/* Mobile Bottom Green Bar */}
      {!isDesktop && (
        <MobileBottomBar>
          <MobileBottomBarText>정보가 더 필요한 장소가 있다면 요청해주세요! 🎯</MobileBottomBarText>
        </MobileBottomBar>
      )}
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
  border-top-color: #d8d8df;
  box-shadow: 0px -4px 20px rgba(0, 0, 0, 0.08);
`;

const ButtonsSection = styled(View)<{ isDesktop: boolean }>`
  padding-top: ${({ isDesktop }) => (isDesktop ? '16px' : '10px')};
  padding-bottom: ${({ isDesktop }) => (isDesktop ? '20px' : '20px')};
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

const LeftButtonsContainer = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-right: 8px;
`;

const LikeButton = styled(View)<{ isDesktop: boolean }>`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${({ isDesktop }) => (isDesktop ? '7px' : '6px')};
  height: ${({ isDesktop }) => (isDesktop ? '60px' : '48px')};
  padding-horizontal: ${({ isDesktop }) => (isDesktop ? '16px' : '10px')};
  padding-vertical: 4px;
  border-radius: 4px;
  border-width: 1px;
  border-color: #d8d8df;
`;

const LikeCount = styled(Text)<{ isDesktop: boolean }>`
  font-family: Pretendard;
  font-size: ${({ isDesktop }) => (isDesktop ? '20px' : '16px')};
  line-height: 30px;
  font-weight: 500;
  color: #24262b;
`;

const ShareButton = styled(View)<{ isDesktop: boolean }>`
  align-items: center;
  justify-content: center;
  width: ${({ isDesktop }) => (isDesktop ? '60px' : '48px')};
  height: ${({ isDesktop }) => (isDesktop ? '60px' : '48px')};
  border-radius: 4px;
  border-width: 1px;
  border-color: #d8d8df;
  background-color: ${color.white};
`;

const CTAButton = styled(View)<{ isDesktop: boolean }>`
  width: 100%;
  height: ${({ isDesktop }) => (isDesktop ? '60px' : '48px')};
  padding-horizontal: ${({ isDesktop }) => (isDesktop ? '32px' : '20px')};
  padding-vertical: 12px;
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
  letter-spacing: -0.36px;
  color: #b8ff55;
`;

const CTAWrapper = styled(View)`
  flex: 1;
  position: relative;
`;

const TooltipContainer = styled(View)`
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  margin-bottom: 5px;
  align-items: center;
  filter: drop-shadow(0px 0px 4px rgba(0, 0, 0, 0.25)) drop-shadow(0px 2px 8px rgba(0, 0, 0, 0.2));
`;

const TooltipContent = styled(View)`
  background-color: #b8ff55;
  padding-horizontal: 20px;
  padding-vertical: 6px;
  border-radius: 4px;
`;

const TooltipText = styled(Text)`
  font-family: Pretendard;
  font-size: 14px;
  line-height: 20px;
  font-weight: 700;
  letter-spacing: -0.28px;
  color: #000000;
`;

const TooltipArrow = styled(View)`
  width: 0;
  height: 0;
  border-left-width: 8px;
  border-left-color: transparent;
  border-right-width: 8px;
  border-right-color: transparent;
  border-top-width: 8px;
  border-top-color: #b8ff55;
`;

const MobileBottomBar = styled(View)`
  background-color: #b8ff55;
  height: 31px;
  width: 100%;
  align-items: center;
  justify-content: center;
  padding-horizontal: 20px;
`;

const MobileBottomBarText = styled(Text)`
  font-family: Pretendard;
  font-size: 14px;
  line-height: 20px;
  font-weight: 700;
  letter-spacing: -0.28px;
  color: #000000;
`;
