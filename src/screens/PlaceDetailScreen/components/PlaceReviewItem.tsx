import React from 'react';

import PlaceReviewItem from '@/components/PlaceReviewItem';
import {PlaceReviewDto} from '@/generated-sources/openapi';

export default function PlaceDetailPlaceReviewItem({
  placeId,
  review,
}: {
  placeId: string;
  review: PlaceReviewDto;
}) {
  return <PlaceReviewItem placeId={placeId} review={review} variant="detail" />;
}
