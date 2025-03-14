import React from 'react';
import styled from 'styled-components/native';

import FilledCheckIcon from '@/assets/icon/ic_filled_check.svg';
import FilledCheckOffIcon from '@/assets/icon/ic_filled_check_off.svg';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

interface SelectableItemProps {
  isSelected: boolean;
  onPress: () => void;
  text: string;
}

export default function SelectableItem({
  isSelected,
  onPress,
  text,
}: SelectableItemProps) {
  return (
    <ItemWrapper isSelected={isSelected} onPress={onPress}>
      {isSelected ? <FilledCheckIcon /> : <FilledCheckOffIcon />}
      <ItemText>{text}</ItemText>
    </ItemWrapper>
  );
}

const ItemText = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 16px;
  color: ${color.gray100};
`;

const ItemWrapper = styled.Pressable<{isSelected: boolean}>`
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  background-color: ${props => (props.isSelected ? color.brand5 : color.white)};
  padding: 16px 12px;
  border-radius: 20px;
  border: 1px solid
    ${props => (props.isSelected ? color.brandColor : color.gray20)};
`;
