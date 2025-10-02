import React from 'react';

import PlaceToiletReviewItem from '@/components/PlaceToiletReviewItem';
import {ToiletReviewListItemDto} from '@/generated-sources/openapi';

export default function ReviewHistoryPlaceToiletReviewItem({
  placeId,
  review,
}: {
  placeId: string;
  review: ToiletReviewListItemDto;
}) {
  return (
    <PlaceToiletReviewItem
      placeId={placeId}
      review={review}
      variant="history"
    />
  );
}
