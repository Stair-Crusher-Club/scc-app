import React from 'react';
import styled from 'styled-components/native';

import {color as colors} from '@/constant/color';

interface SearchCategoryIconProps {
  icon: 'CAFE' | 'CONVENIENCE_STORE' | 'RESTAURANT' | 'HOISPITAL' | 'PHARMACY';
  color?: string;
  size?: number;
  isOn?: boolean;
}

const CategoryEmojiMap = {
  CAFE: {
    off: '☕',
    on: '☕',
    label: '카페',
  },
  CONVENIENCE_STORE: {
    off: '🏪',
    on: '🏪',
    label: '편의점',
  },
  RESTAURANT: {
    off: '🍽️',
    on: '🍽️',
    label: '음식점',
  },
  HOISPITAL: {
    off: '🏥',
    on: '🏥',
    label: '병원',
  },
  PHARMACY: {
    off: '💊',
    on: '💊',
    label: '약국',
  },
};

export default function SearchCategoryIcon({
  icon,
  color,
  size = 18,
  isOn = false,
}: SearchCategoryIconProps) {
  const categoryInfo = CategoryEmojiMap[icon];
  const emoji = categoryInfo
    ? isOn
      ? categoryInfo.on
      : categoryInfo.off
    : '📍';

  return (
    <IconContainer>
      <IconText
        style={{
          fontSize: size,
          color: isOn ? colors.brandColor : (color ?? colors.gray70),
        }}>
        {emoji}
      </IconText>
    </IconContainer>
  );
}

// Export Icons for compatibility
export const Icons = {
  CAFE: ['☕', '☕'],
  CONVENIENCE_STORE: ['🏪', '🏪'],
  RESTAURANT: ['🍽️', '🍽️'],
  HOISPITAL: ['🏥', '🏥'],
  PHARMACY: ['💊', '💊'],
};

const IconContainer = styled.View`
  align-items: center;
  justify-content: center;
`;

const IconText = styled.Text`
  text-align: center;
  line-height: ${props =>
    props.style?.fontSize ? `${props.style.fontSize}px` : '18px'};
`;
