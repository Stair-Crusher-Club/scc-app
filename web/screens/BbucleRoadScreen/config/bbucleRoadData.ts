import type { GetBbucleRoadPageResponseDto } from '@/generated-sources/openapi';

/**
 * ID별 하드코딩 데이터
 * API spec과 동일한 형태로 관리
 */
export const BBUCLE_ROAD_DATA: Record<string, GetBbucleRoadPageResponseDto> = {
  // 예시 데이터 - 실제 데이터로 교체 필요
  // 'gocheok-skydome': {
  //   id: 'gocheok-skydome',
  //   title: '고척스카이돔',
  //   titleImageUrl: 'https://example.com/image.jpg',
  //   summaryItems: [],
  //   sections: [],
  //   routeSection: null,
  // },
};

/**
 * 빈 데이터 템플릿 (새 페이지 생성용)
 */
export const EMPTY_BBUCLE_ROAD_DATA: GetBbucleRoadPageResponseDto = {
  id: '',
  title: '',
  titleImageUrl: '',
  summaryItems: [],
  sections: [],
  routeSection: null,
};

/**
 * Config에서 데이터 조회
 * @param bbucleRoadId - 조회할 ID
 * @returns 데이터 또는 undefined
 */
export function getBbucleRoadConfig(
  bbucleRoadId: string,
): GetBbucleRoadPageResponseDto | undefined {
  return BBUCLE_ROAD_DATA[bbucleRoadId];
}

/**
 * 새 빈 데이터 생성
 * @param bbucleRoadId - 새 페이지의 ID
 * @returns 빈 데이터 템플릿 (ID만 설정됨)
 */
export function createEmptyBbucleRoadData(
  bbucleRoadId: string,
): GetBbucleRoadPageResponseDto {
  return {
    ...EMPTY_BBUCLE_ROAD_DATA,
    id: bbucleRoadId,
  };
}
