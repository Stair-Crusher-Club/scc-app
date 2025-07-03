import React from 'react';
import {View} from 'react-native';

import {AccessibilityInfoDto} from '@/generated-sources/openapi';

import EmptyInfo from './EmptyInfo';
import * as S from './PlaceInfo.style';

interface Props {
  accessibility?: AccessibilityInfoDto;
}

export default function PlaceToiletInfo({accessibility}: Props) {
  if (!accessibility) {
    return <EmptyInfo type="매장 내부 정보" />;
  }

  return (
    <View style={{flex: 1, gap: 20}}>
      <S.InfoWrapper>
        <S.Type>위치</S.Type>
        <S.Title>건물 내 있음</S.Title>
      </S.InfoWrapper>
      <S.InfoWrapper>
        <S.Type>층정보</S.Type>
        <S.Title>1층, 지하</S.Title>
      </S.InfoWrapper>
      <S.InfoWrapper>
        <S.Type>문유형</S.Type>
        <S.Title>자동문(버튼)</S.Title>
      </S.InfoWrapper>
    </View>
  );
}
