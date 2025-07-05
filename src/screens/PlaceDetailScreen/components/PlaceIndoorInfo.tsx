import dayjs from 'dayjs';
import React from 'react';
import {View} from 'react-native';

import {PlaceReviewDto} from '@/generated-sources/openapi';

import * as SS from '../sections/PlaceDetailEntranceSection.style';
import * as S from './NewPlaceInfo.style';

interface Props {
  reviews: PlaceReviewDto[];
}

export default function PlaceIndoorInfo({reviews}: Props) {
  const updatedAt = dayjs(
    Math.max(...reviews.map(review => review.createdAt.value)),
  ).format('YYYY.MM.DD');
  return (
    <View style={{gap: 20}}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          justifyContent: 'space-between',
        }}>
        <SS.Title>내부 이용 정보</SS.Title>
        <SS.Updated>{updatedAt}</SS.Updated>
      </View>
      <S.InfoWrapper>
        <S.LabelText>좌석 구성</S.LabelText>
        <S.TextWrapper>
          <S.ContentText>
            {reviews.flatMap(review => review.seatTypes).join(', ')}
          </S.ContentText>
        </S.TextWrapper>
      </S.InfoWrapper>
      <S.InfoWrapper>
        <S.LabelText>주문방법</S.LabelText>
        <S.TextWrapper>
          <S.ContentText>
            {reviews.flatMap(review => review.orderMethods).join(', ')}
          </S.ContentText>
        </S.TextWrapper>
      </S.InfoWrapper>
      <S.InfoWrapper>
        <S.LabelText>특이사항</S.LabelText>
        <S.TextWrapper>
          <S.ContentText>
            {reviews.flatMap(review => review.features).join(', ')}
          </S.ContentText>
        </S.TextWrapper>
      </S.InfoWrapper>
    </View>
  );
}
