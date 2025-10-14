import React from 'react';

import ToiletReviewItem from '@/components/ToiletReviewItem';
import {ToiletReviewDto} from '@/generated-sources/openapi';
import {UpdateUpvoteStatusParams} from '@/screens/PlaceDetailScreen/types';

export default function PlaceDetailPlaceToiletReviewItem({
  placeId,
  review,
  updateUpvoteStatus,
}: {
  placeId: string;
  review: ToiletReviewDto;
  updateUpvoteStatus?: (params: UpdateUpvoteStatusParams) => Promise<boolean>;
}) {
  return (
    <ToiletReviewItem
      placeId={placeId}
      review={review}
      updateUpvoteStatus={updateUpvoteStatus}
      variant="detail"
    />
  );
}
