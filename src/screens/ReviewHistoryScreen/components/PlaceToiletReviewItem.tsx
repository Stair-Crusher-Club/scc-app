import React from 'react';

import ToiletReviewItem from '@/components/ToiletReviewItem';
import {ToiletReviewListItemDto} from '@/generated-sources/openapi';

export default function ReviewHistoryPlaceToiletReviewItem({
  placeId,
  review,
}: {
  placeId: string;
  review: ToiletReviewListItemDto;
}) {
  return (
    <ToiletReviewItem placeId={placeId} review={review} variant="history" />
  );
}
