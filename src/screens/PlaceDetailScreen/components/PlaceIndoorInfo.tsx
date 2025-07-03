import React from 'react';
import {View} from 'react-native';

import {AccessibilityInfoDto} from '@/generated-sources/openapi';

import EmptyInfo from './EmptyInfo';
import * as S from './PlaceInfo.style';

interface Props {
  accessibility?: AccessibilityInfoDto;
}

export default function PlaceIndoorInfo({accessibility}: Props) {
  if (!accessibility) {
    return <EmptyInfo type="매장 내부 정보" />;
  }

  return (
    <View style={{flex: 1, gap: 20}}>
      <S.BigTitle>내부 이용 정보</S.BigTitle>
      <S.InfoWrapper>
        <S.Type>이용 좌석 구성</S.Type>
        <S.Title>입식, 좌식(신발 벗고 앉는 구조)</S.Title>
      </S.InfoWrapper>
      <S.InfoWrapper>
        <S.Type>주문방법</S.Type>
        <S.Title>입식, 좌식(신발 벗고 앉는 구조)</S.Title>
      </S.InfoWrapper>
      <S.InfoWrapper>
        <S.Type>특이사항</S.Type>
        <S.Title>입식, 좌식(신발 벗고 앉는 구조)</S.Title>
      </S.InfoWrapper>
    </View>
  );
}
