import React from 'react';
import { View, Text } from 'react-native';
import styled from 'styled-components/native';

import { color } from '@/constant/color';
import { useResponsive } from '../context/ResponsiveContext';

interface FloatingHeaderProps {
  title: string;
}

export default function FloatingHeader({ title }: FloatingHeaderProps) {
  const { isDesktop } = useResponsive();

  return (
    <Container isDesktop={isDesktop}>
      <ContentWrapper isDesktop={isDesktop}>
        <Title isDesktop={isDesktop}>{title}</Title>
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
  padding: ${({ isDesktop }) => (isDesktop ? '15px 0px' : '10px 20px')};
  justify-content: center;
  align-items: center;
`;

const Title = styled(Text)<{ isDesktop: boolean }>`
  font-family: Pretendard;
  font-size: ${({ isDesktop }) => (isDesktop ? '22px' : '18px')};
  font-weight: 600;
  color: ${color.black};
  letter-spacing: -0.44px;
  line-height: 30px;
`;
