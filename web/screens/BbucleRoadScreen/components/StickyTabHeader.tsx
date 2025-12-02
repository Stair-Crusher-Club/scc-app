import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import styled from 'styled-components/native';

import { color } from '@/constant/color';

import { DESKTOP_BREAKPOINT } from '../constants/layout';

export interface SectionTab {
  id: string;
  label: string;
}

interface StickyTabHeaderProps {
  sections: SectionTab[];
  activeSection: string;
  onTabPress: (sectionId: string) => void;
}

export default function StickyTabHeader({
  sections,
  activeSection,
  onTabPress,
}: StickyTabHeaderProps) {
  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = windowWidth >= DESKTOP_BREAKPOINT;
  const [isSticky, setIsSticky] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Sticky 상태 감지
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // sentinel이 화면에서 사라지면 sticky 상태
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  if (sections.length === 0) {
    return null;
  }

  return (
    <>
      {/* Sentinel element - sticky 감지용 */}
      <div ref={sentinelRef} style={{ height: 1, marginBottom: -1 }} />
      <Container isDesktop={isDesktop} isSticky={isSticky}>
        <TabsScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            justifyContent: 'center',
            flexGrow: 1,
            paddingHorizontal: 16,
          }}
        >
          <TabsContainer>
            {sections.map((section) => {
              const isActive = section.id === activeSection;
              return (
                <TabButton
                  key={section.id}
                  isDesktop={isDesktop}
                  onPress={() => onTabPress(section.id)}
                  activeOpacity={0.7}
                >
                  <TabLabel isActive={isActive} isDesktop={isDesktop}>
                    {section.label}
                  </TabLabel>
                  {isActive && <ActiveIndicator />}
                </TabButton>
              );
            })}
          </TabsContainer>
        </TabsScrollView>
      </Container>
    </>
  );
}

const Container = styled(View)<{ isDesktop: boolean; isSticky: boolean }>`
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: ${color.gray10};
  padding: ${({ isDesktop }) => (isDesktop ? '16px 0' : '12px 0')};
  border-bottom-width: ${({ isSticky }) => (isSticky ? '1px' : '0')};
  border-bottom-color: #e5e5e5;
  transition: background-color 0.2s ease, border-bottom-width 0.2s ease;
`;

const TabsScrollView = styled(ScrollView)`
  flex-direction: row;
`;

const TabsContainer = styled(View)`
  flex-direction: row;
`;

const TabButton = styled(TouchableOpacity)<{ isDesktop: boolean }>`
  padding: ${({ isDesktop }) => (isDesktop ? '8px 20px' : '8px 16px')};
  align-items: center;
`;

const TabLabel = styled(Text)<{ isActive: boolean; isDesktop: boolean }>`
  font-family: Pretendard;
  font-size: ${({ isDesktop }) => (isDesktop ? '18px' : '16px')};
  font-weight: 500;
  color: ${({ isActive }) => (isActive ? '#000000' : '#999999')};
  letter-spacing: -0.4px;
`;

const ActiveIndicator = styled(View)`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #000000;
`;
