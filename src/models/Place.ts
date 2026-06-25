import type {Place} from '@/generated-sources/openapi';
import {PlaceCategoryDto} from '@/generated-sources/openapi';

/**
 * 리뷰 등록이 가능한 카테고리인지 확인합니다.
 * 모든 카테고리에서 리뷰 등록이 가능합니다.
 */
export function isReviewEnabled(_place: Place | undefined): boolean {
  return true;
}

/**
 * 장소에 표시할 카테고리 라벨을 반환합니다.
 * vendor 원본에서 추출한 세부 카테고리명(displayCategoryName)이 있으면 우선 사용하고,
 * 없으면 category enum 기반 라벨로 fallback 합니다.
 */
export function getPlaceCategoryLabel(place: Place): string {
  return place.displayCategoryName || getCategoryText(place.category);
}

function getCategoryText(category?: PlaceCategoryDto): string {
  switch (category) {
    case PlaceCategoryDto.Restaurant:
      return '식당';
    case PlaceCategoryDto.Cafe:
      return '카페';
    case PlaceCategoryDto.Accomodation:
      return '숙소';
    case PlaceCategoryDto.Market:
      return '시장';
    case PlaceCategoryDto.ConvenienceStore:
      return '편의점';
    case PlaceCategoryDto.Kindergarten:
      return '유치원';
    case PlaceCategoryDto.School:
      return '학교';
    case PlaceCategoryDto.Academy:
      return '학원';
    case PlaceCategoryDto.ParkingLot:
      return '주차장';
    case PlaceCategoryDto.GasStation:
      return '주유소';
    case PlaceCategoryDto.SubwayStation:
      return '지하철역';
    case PlaceCategoryDto.Bank:
      return '은행';
    case PlaceCategoryDto.CulturalFacilities:
      return '문화시설';
    case PlaceCategoryDto.Agency:
      return '대행사';
    case PlaceCategoryDto.PublicOffice:
      return '공공기관';
    case PlaceCategoryDto.Attraction:
      return '관광명소';
    case PlaceCategoryDto.Hospital:
      return '병원';
    case PlaceCategoryDto.Pharmacy:
      return '약국';
    default:
      return '';
  }
}
