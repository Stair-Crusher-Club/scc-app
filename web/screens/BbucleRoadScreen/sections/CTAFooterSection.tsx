import React, { useCallback } from 'react';
import { View, Text, TextInput } from 'react-native';
import styled from 'styled-components/native';

import { color } from '@/constant/color';
import { SccPressable } from '@/components/SccPressable';
import CharacterWheelyBuggyIcon from '@/assets/icon/character_wheely_buggy.svg';
import { useEditMode } from '../context/EditModeContext';
import { useResponsive } from '../context/ResponsiveContext';
import type { CTAFooterSectionData } from '../config/bbucleRoadData';

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
      <ContentWrapper isDesktop={isDesktop}>
        <CharacterWrapper isDesktop={isDesktop}>
          <CharacterWheelyBuggyIcon
            width={isDesktop ? 121 : 52}
            height={isDesktop ? 71 : 31}
            viewBox="0 0 121 71"
          />
        </CharacterWrapper>
        <CTAContentWrapper isDesktop={isDesktop}>
          <TitleWrapper>
            <TitleLine isDesktop={isDesktop}>다른 공연장, 시설 정보와</TitleLine>
            <TitleLine isDesktop={isDesktop}>맛집리스트도 받고 싶다면?</TitleLine>
          </TitleWrapper>

          <SccPressable
            onPress={handleCTAPress}
            elementName="bbucle-road-cta-button"
            logParams={{ buttonUrl, isDesktop }}
            disableLogging={isEditMode}
          >
            <CTAButtonContent isDesktop={isDesktop}>
              <CTAButtonText isDesktop={isDesktop}>정보 받아보기</CTAButtonText>
            </CTAButtonContent>
          </SccPressable>
        </CTAContentWrapper>
      </ContentWrapper>

      {isEditMode && (
        <EditFieldsContainer>
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
  padding-top: ${({ isDesktop }) => (isDesktop ? '80px' : '25px')};
  padding-bottom: ${({ isDesktop }) => (isDesktop ? '80px' : '25px')};
`;

const ContentWrapper = styled(View)<{ isDesktop: boolean }>`
  max-width: 1020px;
  width: 100%;
  margin-horizontal: auto;
`;

const CTAContentWrapper = styled(View)<{ isDesktop: boolean }>`
  width: 100%;
  align-self: center;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
  gap: ${({ isDesktop }) => (isDesktop ? '40px' : '16px')};
  padding-left: ${({ isDesktop }) => (isDesktop ? '0px' : '16px')};
  padding-right: ${({ isDesktop }) => (isDesktop ? '0px' : '16px')};
`;

const TitleWrapper = styled(View)`
  align-items: flex-start;
`;

const TitleLine = styled(Text)<{ isDesktop: boolean }>`
  font-family: Pretendard;
  font-size: ${({ isDesktop }) => (isDesktop ? '28px' : '18px')};
  font-weight: 700;
  color: ${color.white};
  line-height: ${({ isDesktop }) => (isDesktop ? '38px' : '26px')};
  letter-spacing: -0.36px;
`;

const CTAButtonContent = styled(View)<{ isDesktop: boolean }>`
  background-color: ${color.white};
  border: 1px solid #0c76f7;
  width: ${({ isDesktop }) => (isDesktop ? '200px' : '143px')};
  height: ${({ isDesktop }) => (isDesktop ? '50px' : '34px')};
  border-radius: 100px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const CTAButtonText = styled(Text)<{ isDesktop: boolean }>`
  font-family: Pretendard;
  font-size: ${({ isDesktop }) => (isDesktop ? '18px' : '14px')};
  font-weight: 500;
  color: ${color.black};
  line-height: ${({ isDesktop }) => (isDesktop ? '26px' : '20px')};
`;

const EditFieldsContainer = styled(View)`
  background-color: rgba(255, 255, 255, 0.15);
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
  color: ${color.white};
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

const CharacterWrapper = styled(View)<{ isDesktop: boolean }>`
  position: absolute;
  margin-top: ${({ isDesktop }) => (isDesktop ? '-151px' : '-55px')};
  margin-left: ${({ isDesktop }) => (isDesktop ? '29px' : '18px')};
`;
