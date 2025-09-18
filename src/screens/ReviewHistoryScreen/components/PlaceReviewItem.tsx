import React from 'react';

import PlaceReviewItem from '@/components/PlaceReviewItem';
import {PlaceReviewListItemDto} from '@/generated-sources/openapi';
import {UpdateUpvoteStatusParams} from '@/screens/PlaceDetailScreen/types';

export default function ReviewHistoryPlaceReviewItem({
  placeId,
  review,
  updateUpvoteStatus,
}: {
  placeId: string;
  review: PlaceReviewListItemDto;
  updateUpvoteStatus?: (params: UpdateUpvoteStatusParams) => Promise<boolean>;
}) {
  return (
    <PlaceReviewItem
      placeId={placeId}
      review={review}
      updateUpvoteStatus={updateUpvoteStatus}
      variant="history"
    />
  );
}
