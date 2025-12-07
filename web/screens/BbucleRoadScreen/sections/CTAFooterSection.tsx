import React, { useCallback } from 'react';
import { View, Text, TextInput, Image } from 'react-native';
import styled from 'styled-components/native';

import { color } from '@/constant/color';
import { SccPressable } from '@/components/SccPressable';
import CharacterWheelyBuggyIcon from '@/assets/icon/character_wheely_buggy.svg';
import { useEditMode } from '../context/EditModeContext';
import { useResponsive } from '../context/ResponsiveContext';
import type { CTAFooterSectionData } from '../config/bbucleRoadData';

// CTA Footer 이미지
const ctaFooterImagePc = require('@/assets/icon/cta_bbucle_road_footer_pc.png');
const ctaFooterImageMobile = require('@/assets/icon/cta_bbucle_road_footer_mobile.png');

interface CTAFooterSectionProps {
  ctaFooterSection: CTAFooterSectionData;
}

// URL 열기 (딥링크/웹링크 모두 지원, iOS Safari 호환)
const openUrl = (url: string) => {
  const link = document.createElement('a');
  link.href = url;
  // 웹 링크는 새 탭에서 열기
  if (url.startsWith('http://') || url.startsWith('https://')) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function CTAFooterSection({
  ctaFooterSection,
}: CTAFooterSectionProps) {
  const editContext = useEditMode();
  const isEditMode = editContext?.isEditMode ?? false;
  const { isDesktop } = useResponsive();

  const { buttonUrl } = ctaFooterSection;

  const updateCTAFooterSection = useCallback(
    (updates: Partial<CTAFooterSectionData>) => {
      if (!editContext) return;
      editContext.updateData((prev) => ({
        ...prev,
        ctaFooterSection: prev.ctaFooterSection
          ? { ...prev.ctaFooterSection, ...updates }
          : null,
      }));
    },
    [editContext],
  );

  const handleButtonUrlChange = useCallback(
    (text: string) => {
      updateCTAFooterSection({ buttonUrl: text });
    },
    [updateCTAFooterSection],
  );

  const handleCTAPress = useCallback(() => {
    if (buttonUrl) {
      openUrl(buttonUrl);
    }
  }, [buttonUrl]);

  return (
    <Container isDesktop={isDesktop}>
      <OuterWrapper>
        <CharacterWrapper isDesktop={isDesktop}>
          <CharacterWheelyBuggyIcon
            width={isDesktop ? 121 : 52}
            height={isDesktop ? 71 : 31}
            viewBox="0 0 121 71"
          />
        </CharacterWrapper>
        <ContentWrapper isDesktop={isDesktop}>
          <TextAndButtonWrapper isDesktop={isDesktop}>
          <TitleWrapper isDesktop={isDesktop}>
            <TitleLine isDesktop={isDesktop}>휠체어석 정보,</TitleLine>
            <TitleLine isDesktop={isDesktop}>맛집 리스트도 받고 싶다면?</TitleLine>
          </TitleWrapper>

          <SccPressable
            onPress={handleCTAPress}
            elementName="bbucle-road-cta-button"
            logParams={{ buttonUrl, isDesktop }}
            disableLogging={isEditMode}
          >
            <CTAButtonContent isDesktop={isDesktop}>
              <CTAButtonText isDesktop={isDesktop}>🛎️ 정보 먼저 받기</CTAButtonText>
            </CTAButtonContent>
          </SccPressable>
        </TextAndButtonWrapper>

        <FooterImageWrapper isDesktop={isDesktop}>
          <FooterImage
            source={isDesktop ? ctaFooterImagePc : ctaFooterImageMobile}
            resizeMode="contain"
            isDesktop={isDesktop}
          />
        </FooterImageWrapper>
        </ContentWrapper>
      </OuterWrapper>

      {isEditMode && (
        <EditFieldsContainer isDesktop={isDesktop}>
          <EditFieldRow>
            <EditLabel>버튼 URL:</EditLabel>
            <EditInput
              value={buttonUrl}
              onChangeText={handleButtonUrlChange}
              placeholder="https://..."
              placeholderTextColor="#999"
            />
          </EditFieldRow>
        </EditFieldsContainer>
      )}
    </Container>
  );
}

const Container = styled(View)<{ isDesktop: boolean }>`
  width: 100%;
  background-color: #0e64d3;
  padding-top: ${({ isDesktop }) => (isDesktop ? '60px' : '40px')};
  padding-bottom: ${({ isDesktop }) => (isDesktop ? '60px' : '30px')};
`;

const OuterWrapper = styled(View)`
  max-width: 1020px;
  width: 100%;
  margin-horizontal: auto;
  position: relative;
`;

const CharacterWrapper = styled(View)<{ isDesktop: boolean }>`
  position: absolute;
  top: ${({ isDesktop }) => (isDesktop ? '-130px' : '-70px')};
  left: ${({ isDesktop }) => (isDesktop ? '0px' : '18px')};
`;

const ContentWrapper = styled(View)<{ isDesktop: boolean }>`
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: ${({ isDesktop }) => (isDesktop ? '40px' : '0px')};
  padding: ${({ isDesktop }) => (isDesktop ? '0px' : '0px 14px 0px 16px')};
`;

const TextAndButtonWrapper = styled(View)<{ isDesktop: boolean }>`
  flex: ${({ isDesktop }) => (isDesktop ? 'none' : '1')};
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ isDesktop }) => (isDesktop ? '32px' : '12px')};
`;

const TitleWrapper = styled(View)<{ isDesktop: boolean }>`
  align-items: flex-start;
`;

const TitleLine = styled(Text)<{ isDesktop: boolean }>`
  font-family: Pretendard;
  font-size: ${({ isDesktop }) => (isDesktop ? '28px' : '20px')};
  font-weight: 700;
  color: #ffffff;
  line-height: ${({ isDesktop }) => (isDesktop ? '38px' : '28px')};
  letter-spacing: -0.36px;
`;

const CTAButtonContent = styled(View)<{ isDesktop: boolean }>`
  background-color: #ffffff;
  padding-horizontal: ${({ isDesktop }) => (isDesktop ? '39px' : '21.5px')};
  padding-vertical: ${({ isDesktop }) => (isDesktop ? '12px' : '7px')};
  border-radius: 100px;
  border-width: 1px;
  border-color: #0c76f7;
  align-items: center;
  justify-content: center;
`;

const CTAButtonText = styled(Text)<{ isDesktop: boolean }>`
  font-family: Pretendard;
  font-size: ${({ isDesktop }) => (isDesktop ? '18px' : '14px')};
  font-weight: 500;
  color: #232328;
  line-height: ${({ isDesktop }) => (isDesktop ? '26px' : '20px')};
`;

const FooterImageWrapper = styled(View)<{ isDesktop: boolean }>`
  margin-right: ${({ isDesktop }) => (isDesktop ? '34px' : '0px')};
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
`;

const FooterImage = styled(Image)<{ isDesktop: boolean }>`
  width: ${({ isDesktop }) => (isDesktop ? '365.73px' : '138px')};
  height: ${({ isDesktop }) => (isDesktop ? '150px' : '85px')};
`;

const EditFieldsContainer = styled(View)<{ isDesktop: boolean }>`
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 16px;
  gap: 12px;
  max-width: 500px;
  align-self: center;
  margin-top: 24px;
`;

const EditFieldRow = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

const EditLabel = styled(Text)`
  font-size: 14px;
  color: #ffffff;
  min-width: 80px;
`;

const EditInput = styled(TextInput)`
  flex: 1;
  font-size: 14px;
  color: ${color.black};
  background-color: ${color.white};
  border-radius: 8px;
  padding: 8px 12px;
  min-width: 250px;
`;
