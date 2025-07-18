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
        <S.ContentTextWrapper>
          <S.ContentTagWrapper>
            {seatTypes.map(seatType => (
              <S.ContentTag key={seatType}>
                <S.ContentTagText>{seatType}</S.ContentTagText>
              </S.ContentTag>
            ))}
          </S.ContentTagWrapper>
          <S.SubContentText>{seatComments.join(', ')}</S.SubContentText>
        </S.ContentTextWrapper>
      </S.InfoWrapper>
      <S.InfoWrapper>
        <S.LabelText>주문방법</S.LabelText>
        <S.ContentTextWrapper>
          <S.ContentTagWrapper>
            {orderMethods.map(orderMethod => (
              <S.ContentTag key={orderMethod}>
                <S.ContentTagText>{orderMethod}</S.ContentTagText>
              </S.ContentTag>
            ))}
          </S.ContentTagWrapper>
        </S.ContentTextWrapper>
      </S.InfoWrapper>
      {features.length > 0 && (
        <S.InfoWrapper>
          <S.LabelText>특이사항</S.LabelText>
          <S.ContentTextWrapper>
            <S.ContentText>{features.join(', ')}</S.ContentText>
          </S.ContentTextWrapper>
        </S.InfoWrapper>
      )}
    </View>
  );
}
