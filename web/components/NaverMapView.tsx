import React, {useEffect, useRef, useState, useCallback} from 'react';
import styled from 'styled-components';
import {PlaceListItem} from '@/generated-sources/openapi';

declare global {
  interface Window {
    naver: any;
  }
}

interface NaverMapViewProps {
  searchResults: PlaceListItem[];
  onMapViewportChange?: (center: {lat: number; lng: number}) => void;
  currentLocation?: {lat: number; lng: number} | null;
}

interface MarkerData {
  placeId: string;
  marker: any;
  infoWindow: any;
}

export default function NaverMapView({
  searchResults,
  onMapViewportChange,
  currentLocation,
}: NaverMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<MarkerData[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // 기본 위치 (강남역)
  const defaultCenter = {lat: 37.4979, lng: 127.0276};

  // Naver Map 초기화
  useEffect(() => {
    if (
      mapRef.current &&
      window.naver &&
      window.naver.maps &&
      !mapInstanceRef.current
    ) {
      // 현재 위치가 있으면 사용, 없으면 기본 위치 사용
      const initialCenter = currentLocation || defaultCenter;

      const mapOptions = {
        center: new window.naver.maps.LatLng(
          initialCenter.lat,
          initialCenter.lng,
        ),
        zoom: currentLocation ? 16 : 15, // 현재 위치일 때 더 확대
        minZoom: 7,
        maxZoom: 21,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: window.naver.maps.MapTypeControlStyle.BUTTON,
          position: window.naver.maps.Position.TOP_RIGHT,
        },
        zoomControl: true,
        zoomControlOptions: {
          style: window.naver.maps.ZoomControlStyle.SMALL,
          position: window.naver.maps.Position.TOP_RIGHT,
        },
      };

      const map = new window.naver.maps.Map(mapRef.current, mapOptions);
      mapInstanceRef.current = map;

      // 지도 이동 시 콜백
      window.naver.maps.Event.addListener(map, 'dragend', () => {
        const center = map.getCenter();
        onMapViewportChange?.({
          lat: center.lat(),
          lng: center.lng(),
        });
      });

      window.naver.maps.Event.addListener(map, 'zoom_changed', () => {
        const center = map.getCenter();
        onMapViewportChange?.({
          lat: center.lat(),
          lng: center.lng(),
        });
      });

      setIsMapLoaded(true);
    }
  }, [currentLocation, onMapViewportChange]);

  // 현재 위치 업데이트
  useEffect(() => {
    if (mapInstanceRef.current && currentLocation && isMapLoaded) {
      const newCenter = new window.naver.maps.LatLng(
        currentLocation.lat,
        currentLocation.lng,
      );
      mapInstanceRef.current.setCenter(newCenter);
    }
  }, [currentLocation, isMapLoaded]);

  // 마커 생성 및 업데이트
  useEffect(() => {
    if (
      !mapInstanceRef.current ||
      !isMapLoaded ||
      !window.naver ||
      !window.naver.maps
    )
      return;

    // 기존 마커들 제거
    markersRef.current.forEach(({marker, infoWindow}) => {
      marker.setMap(null);
      infoWindow.close();
    });
    markersRef.current = [];

    // 새 마커들 생성
    const newMarkers: MarkerData[] = searchResults.map(item => {
      const position = new window.naver.maps.LatLng(
        item.place.location?.lat || 0,
        item.place.location?.lng || 0,
      );

      // 마커 아이콘 선택
      const getMarkerIcon = (category?: string) => {
        const iconMap: {[key: string]: string} = {
          RESTAURANT: '🍽️',
          CAFE: '☕',
          CONVENIENCE_STORE: '🏪',
          PHARMACY: '💊',
          HOSPITAL: '🏥',
        };
        return iconMap[category || ''] || '📍';
      };

      const marker = new window.naver.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: item.place.name,
        icon: {
          content: `<div style="
            background: white;
            border: 2px solid #007aff;
            border-radius: 20px;
            padding: 4px 8px;
            font-size: 14px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            white-space: nowrap;
          ">${getMarkerIcon(item.place.category)} ${item.place.name}</div>`,
          anchor: new window.naver.maps.Point(0, 0),
        },
      });

      // 정보창 생성
      const infoWindow = new window.naver.maps.InfoWindow({
        content: `
          <div style="padding: 10px; width: 200px;">
            <h4 style="margin: 0 0 8px 0; color: #333;">${item.place.name}</h4>
            <p style="margin: 0; color: #666; font-size: 12px;">${item.place.address}</p>
            ${
              item.accessibilityInfo?.accessibilityScore !== undefined
                ? `<p style="margin: 4px 0 0 0; color: #007aff; font-size: 12px;">
                접근성 점수: ${item.accessibilityInfo.accessibilityScore}/5
              </p>`
                : ''
            }
          </div>
        `,
      });

      // 마커 클릭 이벤트
      window.naver.maps.Event.addListener(marker, 'click', () => {
        // 다른 정보창들 닫기
        markersRef.current.forEach(({infoWindow: otherInfoWindow}) => {
          otherInfoWindow.close();
        });
        infoWindow.open(mapInstanceRef.current, marker);
      });

      return {
        placeId: item.place.id,
        marker,
        infoWindow,
      };
    });

    markersRef.current = newMarkers;

    // 마커들이 모두 보이도록 지도 범위 조정
    if (newMarkers.length > 0) {
      const bounds = new window.naver.maps.LatLngBounds();
      newMarkers.forEach(({marker}) => {
        bounds.extend(marker.getPosition());
      });

      // 현재 위치도 포함
      if (currentLocation) {
        bounds.extend(
          new window.naver.maps.LatLng(
            currentLocation.lat,
            currentLocation.lng,
          ),
        );
      }

      mapInstanceRef.current.fitBounds(bounds, {
        padding: {top: 50, right: 50, bottom: 50, left: 50},
      });
    }
  }, [searchResults, isMapLoaded, currentLocation]);

  // 현재 위치로 이동하는 함수
  const moveToCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          if (mapInstanceRef.current) {
            const newCenter = new window.naver.maps.LatLng(
              newLocation.lat,
              newLocation.lng,
            );
            mapInstanceRef.current.setCenter(newCenter);
            mapInstanceRef.current.setZoom(16);
          }
        },
        error => {
          console.error('현재 위치를 가져올 수 없습니다:', error);
        },
        {enableHighAccuracy: true},
      );
    }
  }, []);

  return (
    <MapContainer>
      <MapDiv ref={mapRef} />
      <MyLocationButton onClick={moveToCurrentLocation}>📍</MyLocationButton>
    </MapContainer>
  );
}

const MapContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const MapDiv = styled.div`
  width: 100%;
  height: 100%;
`;

const MyLocationButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;

  &:hover {
    background: #f5f5f5;
  }

  &:active {
    background: #e5e5e5;
  }
`;
