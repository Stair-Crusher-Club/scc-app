import React from 'react';
import {View} from 'react-native';

import {
  AccessibilityInfoDto,
  PlaceReviewDto,
} from '@/generated-sources/openapi';

import EmptyInfo from './EmptyInfo';
import * as S from './PlaceInfo.style';

interface Props {
  reviews: PlaceReviewDto[];
}

export default function PlaceIndoorInfo({reviews}: Props) {
  return (
    <View style={{flex: 1, gap: 20}}>
      <S.BigTitle>내부 이용 정보</S.BigTitle>
      <S.InfoWrapper>
        <S.Type>이용 좌석 구성</S.Type>
        <S.Title>
          {reviews.flatMap(review => review.seatTypes).join(', ')}
        </S.Title>
      </S.InfoWrapper>
      <S.InfoWrapper>
        <S.Type>주문방법</S.Type>
        <S.Title>
          {reviews.flatMap(review => review.orderMethods).join(', ')}
        </S.Title>
      </S.InfoWrapper>
      <S.InfoWrapper>
        <S.Type>특이사항</S.Type>
        <S.Title>
          {reviews.flatMap(review => review.features).join(', ')}
        </S.Title>
      </S.InfoWrapper>
    </View>
  );
}
