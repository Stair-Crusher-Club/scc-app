import React from 'react';
import {Platform} from 'react-native';
import styled from 'styled-components/native';

import ReviewIcon from '@/assets/icon/ic_review.svg';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

export default function ReviewLabel({count}: {count: number}) {
  return (
    <ReviewLabelContainer>
      <ReviewIcon height={14} width={14} />
      <ReviewLabelText>리뷰 {count}</ReviewLabelText>
    </ReviewLabelContainer>
  );
}

const ReviewLabelContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 2px;
  padding-horizontal: 4px;
  background-color: ${color.brand5};
  border-radius: 4px;
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

const ReviewLabelText = styled.Text`
  font-size: 10px;
  font-family: ${font.pretendardMedium};
  color: ${color.brand};
`;
