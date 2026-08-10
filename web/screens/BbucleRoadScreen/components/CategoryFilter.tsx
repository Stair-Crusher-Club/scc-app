/* eslint-disable no-restricted-imports --
   styled() 의 베이스로만 쓰고 렌더 시 `as={SccPressable}` 로 교체한다 — 클릭은 정상 로깅된다.
   (터치 컴포넌트는 Scc* 사용 원칙: .eslintrc.js no-restricted-imports) */
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';

import { SccPressable } from '@/components/atoms';
import { color } from '@/constant/color';
import { useEditMode } from '../context/EditModeContext';
import { useResponsive } from '../context/ResponsiveContext';

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export default function CategoryFilter({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  const { isDesktop } = useResponsive();
  const editContext = useEditMode();
  const isEditMode = editContext?.isEditMode ?? false;

  return (
    <Container isDesktop={isDesktop}>
      <FilterButton
        as={SccPressable}
        isActive={activeCategory === null}
        isDesktop={isDesktop}
        onPress={() => onCategoryChange(null)}
        elementName="bbucle-road-category-filter"
        logParams={{ category: 'all' }}
        disableLogging={isEditMode}
      >
        <ButtonText isActive={activeCategory === null} isDesktop={isDesktop}>
          전체
        </ButtonText>
      </FilterButton>

      {categories.map((category) => (
        <FilterButton
          as={SccPressable}
          key={category}
          isActive={activeCategory === category}
          isDesktop={isDesktop}
          onPress={() => onCategoryChange(category)}
          elementName="bbucle-road-category-filter"
          logParams={{ category }}
          disableLogging={isEditMode}
        >
          <ButtonText isActive={activeCategory === category} isDesktop={isDesktop}>
            {category}
          </ButtonText>
        </FilterButton>
      ))}
    </Container>
  );
}

const Container = styled(View)<{ isDesktop: boolean }>`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ isDesktop }) => (isDesktop ? '12px' : '8px')};
  margin-bottom: ${({ isDesktop }) => (isDesktop ? '24px' : '16px')};
`;

const FilterButton = styled(TouchableOpacity)<{ isActive: boolean; isDesktop: boolean }>`
  padding: ${({ isDesktop }) => (isDesktop ? '10px 20px' : '8px 16px')};
  border-radius: ${({ isDesktop }) => (isDesktop ? '24px' : '20px')};
  background-color: ${({ isActive }) => (isActive ? color.iosBlue : color.gray10)};
  border: 1px solid ${({ isActive }) => (isActive ? color.iosBlue : color.gray25)};
`;

const ButtonText = styled(Text)<{ isActive: boolean; isDesktop: boolean }>`
  font-size: ${({ isDesktop }) => (isDesktop ? '16px' : '14px')};
  font-weight: ${({ isActive }) => (isActive ? '600' : '400')};
  color: ${({ isActive }) => (isActive ? color.white : color.gray60)};
`;
