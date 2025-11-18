import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';

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
  return (
    <Container>
      <FilterButton
        isActive={activeCategory === null}
        onPress={() => onCategoryChange(null)}
      >
        <ButtonText isActive={activeCategory === null}>전체</ButtonText>
      </FilterButton>

      {categories.map((category) => (
        <FilterButton
          key={category}
          isActive={activeCategory === category}
          onPress={() => onCategoryChange(category)}
        >
          <ButtonText isActive={activeCategory === category}>
            {category}
          </ButtonText>
        </FilterButton>
      ))}
    </Container>
  );
}

const Container = styled(View)`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
`;

const FilterButton = styled(TouchableOpacity)<{ isActive: boolean }>`
  padding: 8px 16px;
  border-radius: 20px;
  background-color: ${({ isActive }) => (isActive ? '#007AFF' : '#F0F0F0')};
  border: 1px solid ${({ isActive }) => (isActive ? '#007AFF' : '#E0E0E0')};
`;

const ButtonText = styled(Text)<{ isActive: boolean }>`
  font-size: 14px;
  font-weight: ${({ isActive }) => (isActive ? '600' : '400')};
  color: ${({ isActive }) => (isActive ? '#FFFFFF' : '#666666')};
`;
