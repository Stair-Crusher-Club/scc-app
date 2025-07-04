import dayjs from 'dayjs';
import React from 'react';
import {View} from 'react-native';

import {PlaceReviewDto} from '@/generated-sources/openapi';

import * as SS from '../sections/PlaceDetailEntranceSection.style';
import * as S from './PlaceInfo.style';

interface Props {
  reviews: PlaceReviewDto[];
}

export default function PlaceIndoorInfo({reviews}: Props) {
  const updatedAt = dayjs(
    Math.max(...reviews.map(review => review.createdAt.value)),
  ).format('YYYY.MM.DD');
  return (
    <View style={{flex: 1, gap: 20}}>
      <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
        <SS.Title>내부 이용 정보</SS.Title>
        <SS.Updated>{updatedAt}</SS.Updated>
      </View>
      <S.InfoWrapper>
        <S.Type>좌석 구성</S.Type>
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
