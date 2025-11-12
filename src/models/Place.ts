import type {Place} from '@/generated-sources/openapi';

/**
 * 리뷰 등록이 가능한 카테고리인지 확인합니다.
 * RESTAURANT, CAFE, 또는 카테고리가 없는 경우 리뷰 등록이 가능합니다.
 */
export function isReviewEnabled(place: Place | undefined): boolean {
  return (
    place?.category === 'RESTAURANT' ||
    place?.category === 'CAFE' ||
    !place?.category
  );
}
