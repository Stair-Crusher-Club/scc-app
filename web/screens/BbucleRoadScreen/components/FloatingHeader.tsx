import React from 'react';
import { View, Text } from 'react-native';
import styled from 'styled-components/native';

import { color } from '@/constant/color';
import { SccPressable } from '@/components/SccPressable';
import IcMenu from '@/assets/icon/ic_menu.svg';
import { useResponsive } from '../context/ResponsiveContext';

interface FloatingHeaderProps {
  title: string;
  onMenuPress?: () => void;
}

export default function FloatingHeader({
  title,
  onMenuPress,
}: FloatingHeaderProps) {
  const { isDesktop } = useResponsive();

  return (
    <Container isDesktop={isDesktop}>
      <ContentWrapper isDesktop={isDesktop}>
        <SccPressable
          elementName="floating-header-menu-button"
          logParams={{ title }}
          onPress={onMenuPress}>
          <IconWrapper>
            <IcMenu width={24} height={24} color={color.black} />
          </IconWrapper>
        </SccPressable>

        <Title isDesktop={isDesktop}>{title}</Title>

        {/* 오른쪽 공간 (닫기 아이콘은 웹뷰 전용이므로 웹에서는 빈 공간으로 유지) */}
        <IconPlaceholder />
      </ContentWrapper>
    </Container>
  );
}

const Container = styled(View)<{ isDesktop: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 200;
  background-color: ${color.white};
`;

const ContentWrapper = styled(View)<{ isDesktop: boolean }>`
  flex-direction: row;
  align-items: center;
  gap: 20px;
  max-width: ${({ isDesktop }) => (isDesktop ? '1020px' : '100%')};
  width: 100%;
  align-self: center;
  padding: ${({ isDesktop }) => (isDesktop ? '15px 0px' : '15px 16px')};
`;

const IconWrapper = styled(View)`
  width: 24px;
  height: 24px;
  justify-content: center;
  align-items: center;
`;

const IconPlaceholder = styled(View)`
  width: 24px;
  height: 24px;
`;

const Title = styled(Text)<{ isDesktop: boolean }>`
  flex: 1;
  font-family: Pretendard;
  font-size: 22px;
  font-weight: 600;
  color: ${color.black};
  letter-spacing: -0.44px;
  line-height: 30px;
  text-align: center;
`;
