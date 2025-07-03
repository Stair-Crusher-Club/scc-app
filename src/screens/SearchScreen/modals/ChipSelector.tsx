import React from 'react';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

export default function ChipSelector<T>({
  items,
  onPress,
}: {
  items: {label: string; option: T; isSelected: boolean}[];
  onPress: (option: T) => void;
}) {
  return (
    <Container>
      {items.map(({label, option, isSelected}, index) => (
        <FilterChip
          key={index}
          isActive={isSelected}
          text={label}
          onPress={() => onPress(option)}
        />
      ))}
    </Container>
  );
}

function FilterChip({
  isActive,
  text,
  onPress,
}: {
  isActive: boolean;
  text: string;
  onPress: () => void;
}) {
  return (
    <FilterChipBox isActive={isActive} onPress={onPress}>
      <ChipText isActive={isActive}>{text}</ChipText>
    </FilterChipBox>
  );
}

const Container = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 8px;
`;

const FilterChipBox = styled.Pressable<{isActive: boolean}>`
  display: flex;
  flex-direction: row;
  background-color: ${color.white};
  border-radius: 12px;
  border-width: 1px;
  border-color: ${({isActive}) => (isActive ? color.brandColor : color.gray20)};
  align-items: center;
  justify-content: center;
  padding-top: 8px;
  padding-bottom: 8px;
  padding-right: 16px;
  padding-left: 16px;
`;

const ChipText = styled.Text<{isActive: boolean}>`
  font-size: 14px;
  font-family: ${font.pretendardMedium};
  color: ${({isActive}) => (isActive ? color.brandColor : color.gray90)};
`;
