import React from 'react';
import {Platform} from 'react-native';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';
import ReviewLabel from '@/screens/SearchScreen/components/ReviewLabel';

interface TagsProps {
  texts: string[];
  hasReview?: boolean;
  reviewCount?: number;
}

export default function Tags({texts, hasReview, reviewCount}: TagsProps) {
  return (
    <Container>
      {texts.map((text, index) => (
        <Tag key={index}>
          <TagText>{text}</TagText>
        </Tag>
      ))}

      {hasReview && <ReviewLabel count={reviewCount ?? 0} />}
    </Container>
  );
}

const Container = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
`;

const Tag = styled.View`
  background-color: ${color.brand5};
  border-radius: 4px;
  padding-horizontal: 4px;
  height: 20px;
  ${Platform.select({
    ios: {
      'padding-vertical': '4px',
    },
    android: {
      'padding-top': '3px',
      'padding-bottom': '4px',
    },
  })}
`;

const TagText = styled.Text`
  font-size: 10px;
  font-family: ${font.pretendardRegular};
  color: ${color.gray80};
`;
