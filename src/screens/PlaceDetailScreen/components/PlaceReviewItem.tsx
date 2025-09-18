import React from 'react';

import PlaceReviewItem from '@/components/PlaceReviewItem';
import {PlaceReviewDto} from '@/generated-sources/openapi';
import {UpdateUpvoteStatusParams} from '@/screens/PlaceDetailScreen/types';

export default function PlaceDetailPlaceReviewItem({
  placeId,
  review,
  updateUpvoteStatus,
}: {
  placeId: string;
  review: PlaceReviewDto;
  updateUpvoteStatus?: (params: UpdateUpvoteStatusParams) => Promise<boolean>;
}) {
  return (
    <PlaceReviewItem
      placeId={placeId}
      review={review}
      updateUpvoteStatus={updateUpvoteStatus}
      variant="detail"
    />
  );
}
