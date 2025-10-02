import React from 'react';

import PlaceReviewItem from '@/components/PlaceReviewItem';
import {PlaceReviewListItemDto} from '@/generated-sources/openapi';

export default function ReviewHistoryPlaceReviewItem({
  placeId,
  review,
}: {
  placeId: string;
  review: PlaceReviewListItemDto;
}) {
  return (
    <PlaceReviewItem placeId={placeId} review={review} variant="history" />
  );
}
