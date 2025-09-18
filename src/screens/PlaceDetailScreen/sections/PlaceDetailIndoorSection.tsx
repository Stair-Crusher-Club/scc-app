import React from 'react';
import {View} from 'react-native';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {PlaceReviewDto} from '@/generated-sources/openapi';
import PlaceIndoorInfo from '@/screens/PlaceDetailScreen/components/PlaceIndoorInfo';
import PlaceReviewSummaryInfo from '@/screens/PlaceDetailScreen/components/PlaceReviewSummaryInfo';
import PlaceVisitReviewInfo from '@/screens/PlaceDetailScreen/components/PlaceVisitReviewInfo';
import {UpdateUpvoteStatusParams} from '@/screens/PlaceDetailScreen/types';

interface Props {
  reviews: PlaceReviewDto[];
  placeId: string;
  updateUpvoteStatus?: (params: UpdateUpvoteStatusParams) => Promise<boolean>;
}

export default function PlaceDetailIndoorSection({
  reviews,
  placeId,
  updateUpvoteStatus,
}: Props) {
  if (reviews.length === 0) {
    return null;
  }

  return (
    <View
      style={{
        gap: 32,
        paddingVertical: 32,
        paddingHorizontal: 20,
        backgroundColor: color.white,
      }}>
      <PlaceIndoorInfo reviews={reviews} />
      <Divider />
      <PlaceReviewSummaryInfo reviews={reviews} placeId={placeId} />
      <Divider />
      <PlaceVisitReviewInfo
        reviews={reviews}
        placeId={placeId}
        updateUpvoteStatus={updateUpvoteStatus}
      />
    </View>
  );
}

const Divider = styled.View({height: 1, backgroundColor: color.gray20});
