import React from 'react';
import {View} from 'react-native';

import {ToiletReviewDto} from '@/generated-sources/openapi';
import {
  ENTRANCE_DOOR_TYPE_LABELS,
  TOILET_LOCATION_TYPE_LABELS,
} from '@/screens/PlaceDetailScreen/constants/labels';

import * as S from './PlaceInfo.style';

interface Props {
  toilet: ToiletReviewDto;
}

export default function PlaceToiletInfo({toilet}: Props) {
  return (
    <View style={{flex: 1, gap: 20}}>
      <S.InfoWrapper>
        <S.Type>위치</S.Type>
        <S.Title>
          {TOILET_LOCATION_TYPE_LABELS[toilet.toiletLocationType]}
        </S.Title>
      </S.InfoWrapper>
      <S.InfoWrapper>
        <S.Type>층정보</S.Type>
        <S.Title>{toilet.floor}층</S.Title>
      </S.InfoWrapper>
      <S.InfoWrapper>
        <S.Type>문유형</S.Type>
        <S.Title>
          {toilet.entranceDoorTypes?.map(
            type => ENTRANCE_DOOR_TYPE_LABELS[type],
          )}
        </S.Title>
      </S.InfoWrapper>
    </View>
  );
}
