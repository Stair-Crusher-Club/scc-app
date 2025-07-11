import React from 'react';
import {View} from 'react-native';

import {doorTypeMap} from '@/constant/options';
import {TOILET_LOCATION_TYPE_LABELS} from '@/constant/review';
import {ToiletReviewDto} from '@/generated-sources/openapi';
import ImageList from '@/screens/PlaceDetailScreen/components/PlaceDetailImageList';

import * as S from './NewPlaceInfo.style';

interface Props {
  toilet: ToiletReviewDto;
}

export default function PlaceToiletInfo({toilet}: Props) {
  return (
    <View style={{flexDirection: 'row', gap: 12}}>
      <View style={{flex: 1, gap: 4}}>
        <S.InfoWrapper>
          <S.LabelText>위치</S.LabelText>
          <S.TextWrapper>
            <S.ContentText>
              {TOILET_LOCATION_TYPE_LABELS[toilet.toiletLocationType]}
            </S.ContentText>
          </S.TextWrapper>
        </S.InfoWrapper>
        <S.InfoWrapper>
          <S.LabelText>층정보</S.LabelText>
          <S.TextWrapper>
            <S.ContentText>{toilet.floor}층</S.ContentText>
          </S.TextWrapper>
        </S.InfoWrapper>
        <S.InfoWrapper>
          <S.LabelText>문유형</S.LabelText>
          <S.TextWrapper>
            <S.ContentText>
              {toilet.entranceDoorTypes?.map(type => doorTypeMap[type])}
            </S.ContentText>
          </S.TextWrapper>
        </S.InfoWrapper>
      </View>
      <ImageList images={toilet.images || []} roundCorners isSinglePreview />
    </View>
  );
}
