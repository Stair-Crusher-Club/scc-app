import React from 'react';

import {ToiletReviewDto} from '@/generated-sources/openapi';
import PlaceToiletInfo from '@/screens/PlaceDetailScreen/components/PlaceToiletInfo';

import ImageList from '../components/PlaceDetailImageList';
import * as S from './PlaceDetailEntranceSection.style';

interface Props {
  toiletReviews: ToiletReviewDto[];
}

export default function PlaceDetailToiletSection({toiletReviews}: Props) {
  // function handlePressAddComment() {
  // navigation.navigate('AddComment', {
  //   type: 'building',
  //   buildingId: building.id,
  //   placeId: place.id,
  // });
  // }
  const toilet = toiletReviews[0];

  return (
    <S.Section>
      <S.SubSection>
        <S.Title>장애인 화장실 정보</S.Title>
      </S.SubSection>
      <S.InfoContent>
        <PlaceToiletInfo toilet={toilet} />
      </S.InfoContent>
    </S.Section>
  );
}
