import React from 'react';

import PlaceToiletReviewItem from '@/components/PlaceToiletReviewItem';
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
    <PlaceToiletReviewItem
      placeId={placeId}
      review={review}
      updateUpvoteStatus={updateUpvoteStatus}
      variant="detail"
    />
  );
}
