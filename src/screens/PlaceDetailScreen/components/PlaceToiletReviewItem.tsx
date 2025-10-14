import React from 'react';

import ToiletReviewItem from '@/components/ToiletReviewItem';
import {ToiletReviewDto} from '@/generated-sources/openapi';

export default function PlaceDetailPlaceToiletReviewItem({
  placeId,
  review,
}: {
  placeId: string;
  review: ToiletReviewDto;
}) {
  return (
    <ToiletReviewItem placeId={placeId} review={review} variant="detail" />
  );
}
