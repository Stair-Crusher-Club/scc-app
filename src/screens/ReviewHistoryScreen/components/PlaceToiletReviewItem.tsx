import React from 'react';

import PlaceToiletReviewItem from '@/components/PlaceToiletReviewItem';
import {ToiletReviewListItemDto} from '@/generated-sources/openapi';
import {UpdateUpvoteStatusParams} from '@/screens/PlaceDetailScreen/types';

export default function ReviewHistoryPlaceToiletReviewItem({
  placeId,
  review,
  updateUpvoteStatus,
}: {
  placeId: string;
  review: ToiletReviewListItemDto;
  updateUpvoteStatus?: (params: UpdateUpvoteStatusParams) => Promise<boolean>;
}) {
  return (
    <PlaceToiletReviewItem
      placeId={placeId}
      review={review}
      updateUpvoteStatus={updateUpvoteStatus}
      variant="history"
    />
  );
}
