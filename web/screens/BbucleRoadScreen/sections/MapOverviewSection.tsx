import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import styled from 'styled-components/native';
import type { BbucleRoadSectionDto, BbucleRoadMarkerDto, BbucleRoadMarkerTypeDto } from '@/generated-sources/openapi';

import BbucleRoadMap from '../components/BbucleRoadMap';
import CategoryFilter from '../components/CategoryFilter';

interface MapOverviewSectionProps {
  section: BbucleRoadSectionDto;
}

export default function MapOverviewSection({ section }: MapOverviewSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  // 현재 위치 가져오기
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log('위치 정보를 가져올 수 없습니다:', error);
        },
      );
    }
  }, []);

  // Convert marker types to category labels
  const categoryLabels: Record<string, string> = {
    RESTAURANT: '음식점',
    CAFE: '카페',
    ACCESSIBLE_TOILET: '장애인화장실',
    ACCESSIBILITY_INFO: '접근성 정보',
  };

  // markers 배열에서 실제 사용된 마커 타입 추출
  const usedMarkerTypes = Array.from(
    new Set(
      section.markers
        ?.filter((marker: BbucleRoadMarkerDto) => categoryLabels[marker.markerType])
        .map((marker: BbucleRoadMarkerDto) => marker.markerType) || []
    )
  );

  // 정해진 순서로 정렬
  const categoryOrder: BbucleRoadMarkerTypeDto[] = ['RESTAURANT', 'CAFE', 'ACCESSIBLE_TOILET', 'ACCESSIBILITY_INFO'];
  const sortedTypes = usedMarkerTypes.sort(
    (a: BbucleRoadMarkerTypeDto, b: BbucleRoadMarkerTypeDto) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
  );

  // 한글 라벨로 변환
  const categories = sortedTypes.map((type: BbucleRoadMarkerTypeDto) => categoryLabels[type]);

  return (
    <Container>
      {section.title && <SectionTitle>{section.title}</SectionTitle>}

      <DescriptionBanner>
        <DescriptionText>원하는 시설을 선택하고 위치와 동선을 확인해보세요!</DescriptionText>
      </DescriptionBanner>

      <MapContainer>
        <BbucleRoadMap
          mapCenter={section.mapCenter}
          mapZoomLevel={section.mapZoomLevel || 17}
          markers={section.markers}
          activeCategory={activeCategory}
          currentLocation={currentLocation}
        />

        {categories.length > 0 && (
          <CategoryFilterOverlay>
            <CategoryFilter
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </CategoryFilterOverlay>
        )}
      </MapContainer>
    </Container>
  );
}

const Container = styled(View)`
  padding: 24px 16px;
  margin-bottom: 150px;
`;

const SectionTitle = styled(Text)`
  color: #000;
  text-align: center;
  font-family: Pretendard;
  font-size: 48px;
  font-style: normal;
  font-weight: 700;
  line-height: 130%;
  letter-spacing: -2.4px;
  margin-bottom: 20px;
  word-wrap: break-word;
  overflow-wrap: break-word;
`;

const DescriptionBanner = styled(View)`
  background-color: #0c76f7;
  padding: 20px 10px;
  align-items: center;
  justify-content: center;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
`;

const DescriptionText = styled(Text)`
  font-family: Pretendard;
  font-size: 24px;
  font-weight: 400;
  line-height: 38px;
  color: #ffffff;
  text-align: center;
`;

const MapContainer = styled(View)`
  position: relative;
  width: 100%;
  max-width: 1000px;
  min-height: 300px;
  max-height: 800px;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f0f0f0;
  align-self: center;
`;

const CategoryFilterOverlay = styled(View)`
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 10;
`;
