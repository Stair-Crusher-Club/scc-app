import React, { useEffect, useRef, useState, useCallback } from 'react';
import styled from 'styled-components';
import type { Location, BbucleRoadMarkerDto, BbucleRoadMarkerTypeDto } from '@/generated-sources/openapi';
import type { MarkerIcon } from '@/components/maps/MarkerItem';
import { getMarkerSvg, MarkerColors } from '@/assets/markers';
import MarkerTicketBoothRaw from '@/assets/icon/ic_marker_ticket_booth.svg.txt';
import MarkerBusStopRaw from '@/assets/icon/ic_marker_bus_stop.svg.txt';
import MarkerElevatorRaw from '@/assets/icon/ic_marker_elevator.svg.txt';
import { useResponsive } from '../context/ResponsiveContext';

// Naver Maps 타입 정의
interface NaverMaps {
  Map: new (element: HTMLElement, options: NaverMapOptions) => NaverMapInstance;
  LatLng: new (lat: number, lng: number) => NaverLatLng;
  Marker: new (options: NaverMarkerOptions) => NaverMarker;
  InfoWindow: new (options: NaverInfoWindowOptions) => NaverInfoWindow;
  Point: new (x: number, y: number) => NaverPoint;
  Event: {
    addListener: (target: NaverMarker, event: string, handler: () => void) => void;
  };
  ZoomControlStyle: { SMALL: number };
  Position: { TOP_RIGHT: number };
}

interface NaverMapOptions {
  center: NaverLatLng;
  zoom: number;
  minZoom?: number;
  maxZoom?: number;
  mapTypeControl?: boolean;
  zoomControl?: boolean;
  zoomControlOptions?: {
    style: number;
    position: number;
  };
}

interface NaverMapInstance {
  setCenter: (position: NaverLatLng) => void;
  setZoom: (level: number) => void;
}

interface NaverLatLng {
  lat: () => number;
  lng: () => number;
}

interface NaverMarkerOptions {
  position: NaverLatLng;
  map: NaverMapInstance | null;
  icon?: {
    content: string;
    anchor: NaverPoint;
  };
  zIndex?: number;
}

interface NaverMarker {
  setMap: (map: NaverMapInstance | null) => void;
}

interface NaverInfoWindowOptions {
  content: string;
}

interface NaverInfoWindow {
  open: (map: NaverMapInstance, marker: NaverMarker) => void;
  close: () => void;
  getMap: () => NaverMapInstance | null;
}

interface NaverPoint {
  x: number;
  y: number;
}

declare global {
  interface Window {
    naver: {
      maps: NaverMaps;
    };
  }
}

interface BbucleRoadMapProps {
  mapCenter?: Location;
  mapZoomLevel?: number;
  markers?: BbucleRoadMarkerDto[];
  activeCategory?: string | null;
  currentLocation?: { lat: number; lng: number } | null;
}

interface MapMarkerData {
  markerId: string;
  marker: NaverMarker;
  infoWindow: NaverInfoWindow | null;
}

export default function BbucleRoadMap({
  mapCenter,
  mapZoomLevel,
  markers,
  activeCategory,
  currentLocation,
}: BbucleRoadMapProps) {
  const { isDesktop } = useResponsive();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<NaverMapInstance | null>(null);
  const markersRef = useRef<MapMarkerData[]>([]);
  const currentLocationMarkerRef = useRef<NaverMarker | null>(null);
  const initialCenterRef = useRef<Location | undefined>(mapCenter);
  const initialZoomRef = useRef<number>(mapZoomLevel || 15);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // 마커 타입 → 아이콘 매핑
  const getMarkerIconType = (markerType: BbucleRoadMarkerTypeDto): MarkerIcon | null => {
    const iconMap: Record<string, MarkerIcon> = {
      RESTAURANT: 'rest',
      CAFE: 'cafe',
      ACCESSIBLE_TOILET: 'toilet',
      ACCESSIBILITY_INFO: 'default',
      TICKET_BOOTH: 'default',
      ENTRANCE: 'default',
      ELEVATOR: 'default',
      SUBWAY_EXIT: 'default',
      BUS_STOP: 'default',
      PARKING: 'default',
    };
    return iconMap[markerType] || null;
  };

  // 지도 초기화
  useEffect(() => {
    if (
      mapRef.current &&
      window.naver &&
      window.naver.maps &&
      !mapInstanceRef.current &&
      mapCenter
    ) {
      const mapOptions = {
        center: new window.naver.maps.LatLng(
          mapCenter.lat,
          mapCenter.lng,
        ),
        zoom: mapZoomLevel || 15,
        minZoom: 7,
        maxZoom: 21,
        mapTypeControl: false,
        zoomControl: true,
        zoomControlOptions: {
          style: window.naver.maps.ZoomControlStyle.SMALL,
          position: window.naver.maps.Position.TOP_RIGHT,
        },
      };

      const map = new window.naver.maps.Map(mapRef.current, mapOptions);
      mapInstanceRef.current = map;
      setIsMapLoaded(true);
    }
  }, [mapCenter, mapZoomLevel]);

  // 현재 위치 마커 업데이트
  useEffect(() => {
    if (mapInstanceRef.current && isMapLoaded) {
      // 기존 현재 위치 마커 제거
      if (currentLocationMarkerRef.current) {
        currentLocationMarkerRef.current.setMap(null);
        currentLocationMarkerRef.current = null;
      }

      // 새 현재 위치 마커 추가
      if (currentLocation) {
        const position = new window.naver.maps.LatLng(
          currentLocation.lat,
          currentLocation.lng,
        );

        const marker = new window.naver.maps.Marker({
          position,
          map: mapInstanceRef.current,
          icon: {
            content: `
              <div style="
                width: 16px;
                height: 16px;
                background: #FF5722;
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              "></div>
            `,
            anchor: new window.naver.maps.Point(8, 8),
          },
          zIndex: 999,
        });

        currentLocationMarkerRef.current = marker;
      }
    }
  }, [currentLocation, isMapLoaded]);

  // 마커 렌더링
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapLoaded) return;

    // 기존 마커 제거
    markersRef.current.forEach((markerData) => {
      markerData.marker.setMap(null);
      if (markerData.infoWindow) {
        markerData.infoWindow.close();
      }
    });
    markersRef.current = [];

    // 카테고리 필터링 (카테고리 레이블 → 마커 타입 매핑)
    const categoryToTypeMap: Record<string, BbucleRoadMarkerTypeDto> = {
      '음식점': 'RESTAURANT',
      '카페': 'CAFE',
      '장애인화장실': 'ACCESSIBLE_TOILET',
      '접근성 정보': 'ACCESSIBILITY_INFO',
    };

    const filteredMarkers = activeCategory
      ? (markers?.filter((m) => m.markerType === categoryToTypeMap[activeCategory]) || [])
      : markers;

    // 마커 생성
    filteredMarkers?.forEach((markerData) => {
      if (!markerData.location) return;

      const position = new window.naver.maps.LatLng(
        markerData.location.lat,
        markerData.location.lng,
      );

      let markerContent: string;

      if (markerData.markerType === 'CUSTOM' && markerData.customImageUrl) {
        // CUSTOM 마커: 이미지 URL 사용
        const width = markerData.customImageWidth || 100;
        const height = markerData.customImageHeight || 60;
        markerContent = `
          <div style="position: relative;">
            <img
              src="${markerData.customImageUrl}"
              style="width: ${width}px; height: ${height}px; display: block;"
              alt="${markerData.tooltipName}"
            />
          </div>
        `;
      } else {
        // 기본 마커: SVG 아이콘 사용
        let markerSvg: string;

        // 특수 마커 타입은 직접 SVG 사용
        if (markerData.markerType === 'TICKET_BOOTH') {
          markerSvg = MarkerTicketBoothRaw;
        } else if (markerData.markerType === 'BUS_STOP') {
          markerSvg = MarkerBusStopRaw;
        } else if (markerData.markerType === 'ELEVATOR') {
          markerSvg = MarkerElevatorRaw;
        } else {
          // 일반 마커는 getMarkerSvg 사용 (Off 버전 + 색상 교체)
          const iconType = getMarkerIconType(markerData.markerType);
          if (!iconType) return;
          const baseSvg = getMarkerSvg(iconType, false, false);
          // SVG의 fill 색상을 MarkerColors['0']로 교체
          markerSvg = baseSvg.replace(/fill="[^"]*"/g, `fill="${MarkerColors['0']}"`);
        }

        // tooltipName이 있을 때만 캡션 표시
        if (markerData.tooltipName && markerData.tooltipName.trim()) {
          markerContent = `
            <div style="
              display: flex;
              flex-direction: column;
              align-items: center;
              cursor: pointer;
            ">
              <div style="width: 32px; height: 32px;">
                ${markerSvg}
              </div>
              <div style="
                background-color: rgba(0, 0, 0, 0.75);
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 500;
                white-space: nowrap;
                margin-top: 4px;
              ">
                ${markerData.tooltipName}
              </div>
            </div>
          `;
        } else {
          // tooltipName이 없으면 아이콘만
          markerContent = `<div style="width: 32px; height: 32px;">${markerSvg}</div>`;
        }
      }

      const marker = new window.naver.maps.Marker({
        position,
        map: mapInstanceRef.current,
        icon: {
          content: markerContent,
          anchor: new window.naver.maps.Point(16, 16),
        },
        zIndex: 100,
      });

      // tooltipName이 있을 때만 InfoWindow 생성 (클릭 시 표시용)
      let infoWindow = null;
      if (markerData.tooltipName && markerData.tooltipName.trim()) {
        infoWindow = new window.naver.maps.InfoWindow({
          content: `
            <div style="
              padding: 8px 12px;
              background-color: white;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.15);
              font-size: 14px;
              font-weight: 500;
              color: #333;
            ">
              ${markerData.tooltipName}
            </div>
          `,
        });

        // 마커 클릭 이벤트
        window.naver.maps.Event.addListener(marker, 'click', () => {
          if (infoWindow!.getMap()) {
            infoWindow!.close();
          } else {
            infoWindow!.open(mapInstanceRef.current, marker);
          }
        });
      }

      markersRef.current.push({
        markerId: `${markerData.markerType}-${markerData.location.lat}-${markerData.location.lng}`,
        marker,
        infoWindow,
      });
    });
  }, [markers, isMapLoaded, activeCategory]);

  // 현위치로 이동
  const handleMoveToCurrentLocation = useCallback(() => {
    if (mapInstanceRef.current && currentLocation) {
      const position = new window.naver.maps.LatLng(
        currentLocation.lat,
        currentLocation.lng,
      );
      mapInstanceRef.current.setCenter(position);
      mapInstanceRef.current.setZoom(17);
    }
  }, [currentLocation]);

  // 초기 위치로 되돌리기
  const handleResetToInitialPosition = useCallback(() => {
    if (mapInstanceRef.current && initialCenterRef.current) {
      const position = new window.naver.maps.LatLng(
        initialCenterRef.current.lat,
        initialCenterRef.current.lng,
      );
      mapInstanceRef.current.setCenter(position);
      mapInstanceRef.current.setZoom(initialZoomRef.current);
    }
  }, []);

  return (
    <MapWrapper>
      <MapContainer ref={mapRef} />
      <ControlButtons isDesktop={isDesktop}>
        <ControlButton
          isDesktop={isDesktop}
          onClick={handleResetToInitialPosition}
          title="최초 지도 뷰로 초기화"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V1L7 6L12 11V7C15.31 7 18 9.69 18 13C18 16.31 15.31 19 12 19C8.69 19 6 16.31 6 13H4C4 17.42 7.58 21 12 21C16.42 21 20 17.42 20 13C20 8.58 16.42 5 12 5Z" fill="#333333"/>
          </svg>
        </ControlButton>
        <ControlButton
          isDesktop={isDesktop}
          onClick={handleMoveToCurrentLocation}
          title="현위치로 이동"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 8C9.79 8 8 9.79 8 12C8 14.21 9.79 16 12 16C14.21 16 16 14.21 16 12C16 9.79 14.21 8 12 8ZM20.94 11C20.48 6.83 17.17 3.52 13 3.06V1H11V3.06C6.83 3.52 3.52 6.83 3.06 11H1V13H3.06C3.52 17.17 6.83 20.48 11 20.94V23H13V20.94C17.17 20.48 20.48 17.17 20.94 13H23V11H20.94ZM12 19C8.13 19 5 15.87 5 12C5 8.13 8.13 5 12 5C15.87 5 19 8.13 19 12C19 15.87 15.87 19 12 19Z" fill="#FF5722"/>
          </svg>
        </ControlButton>
      </ControlButtons>
    </MapWrapper>
  );
}

const MapWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const MapContainer = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
`;

const ControlButtons = styled.div<{ isDesktop: boolean }>`
  position: absolute;
  bottom: ${({ isDesktop }) => (isDesktop ? '20px' : '12px')};
  right: ${({ isDesktop }) => (isDesktop ? '20px' : '12px')};
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${({ isDesktop }) => (isDesktop ? '12px' : '8px')};
  z-index: 10;
`;

const ControlButton = styled.button<{ isDesktop: boolean }>`
  width: ${({ isDesktop }) => (isDesktop ? '48px' : '40px')};
  height: ${({ isDesktop }) => (isDesktop ? '48px' : '40px')};
  background-color: white;
  border: none;
  border-radius: ${({ isDesktop }) => (isDesktop ? '12px' : '8px')};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background-color: #f5f5f5;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: scale(0.95);
  }
`;
