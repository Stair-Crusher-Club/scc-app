import dayjs from 'dayjs';
import React from 'react';
import {View} from 'react-native';

import {PlaceReviewDto} from '@/generated-sources/openapi';
import {SEAT_TYPE_OPTIONS} from '@/screens/PlaceReviewFormScreen/constants';

import * as SS from '../sections/PlaceDetailEntranceSection.style';
import * as S from './NewPlaceInfo.style';

interface Props {
  reviews: PlaceReviewDto[];
}

export default function PlaceIndoorInfo({reviews}: Props) {
  const updatedAt = dayjs(
    Math.max(...reviews.map(review => review.createdAt.value)),
  ).format('YYYY.MM.DD');

  const allSeatTypes = [
    ...new Set(reviews.flatMap(review => review.seatTypes)),
  ];
  const seatTypes: string[] = [];
  const seatComments: string[] = [];
  allSeatTypes.forEach(review => {
    if (SEAT_TYPE_OPTIONS.includes(review)) {
      seatTypes.push(review);
    } else {
      seatComments.push(review);
    }
  });

  const orderMethods = [
    ...new Set(reviews.flatMap(review => review.orderMethods)),
  ];
  const features = [...new Set(reviews.flatMap(review => review.features))];
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
        <View style={{flex: 1}}>
          <S.ContentText>{seatTypes.join(', ')}</S.ContentText>
          <S.SubContentText>{seatComments.join('\n')}</S.SubContentText>
        </View>
      </S.InfoWrapper>
      <S.InfoWrapper>
        <S.LabelText>주문방법</S.LabelText>
        <S.ContentText>{orderMethods.join(', ')}</S.ContentText>
      </S.InfoWrapper>
      {features.length > 0 && (
        <S.InfoWrapper>
          <S.LabelText>특이사항</S.LabelText>
          <S.ContentText>{features.join(', ')}</S.ContentText>
        </S.InfoWrapper>
      )}
    </View>
  );
}
