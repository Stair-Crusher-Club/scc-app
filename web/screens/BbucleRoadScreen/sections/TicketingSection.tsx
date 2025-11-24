import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import styled from 'styled-components/native';
import type { BbucleRoadSectionDto } from '@/generated-sources/openapi';

import BbucleRoadMap from '../components/BbucleRoadMap';
import SccRemoteImage from '@/components/SccRemoteImage';

interface TicketingSectionProps {
  section: BbucleRoadSectionDto;
}

export default function TicketingSection({ section }: TicketingSectionProps) {
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

  return (
    <Container>
      {section.title && <SectionTitle>{section.title}</SectionTitle>}

      <ContentWrapper>
        <MapContainer>
          <BbucleRoadMap
            mapCenter={section.mapCenter}
            mapZoomLevel={section.mapZoomLevel || 17}
            markers={section.markers}
            currentLocation={currentLocation}
          />
        </MapContainer>

        {section.imageUrls && section.imageUrls.length > 0 && (
          <DescriptionContainer>
            {section.imageUrls.map((imageUrl: string, index: number) => (
              <SccRemoteImage
                key={index}
                imageUrl={imageUrl}
                resizeMode="contain"
              />
            ))}
          </DescriptionContainer>
        )}
      </ContentWrapper>
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

const ContentWrapper = styled(View)`
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
`;

const MapContainer = styled(View)`
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

const DescriptionContainer = styled(View)`
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
`;
