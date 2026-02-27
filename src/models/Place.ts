import type {Place} from '@/generated-sources/openapi';

/**
 * 리뷰 등록이 가능한 카테고리인지 확인합니다.
 * 모든 카테고리에서 리뷰 등록이 가능합니다.
 */
export function isReviewEnabled(_place: Place | undefined): boolean {
  return true;
}
