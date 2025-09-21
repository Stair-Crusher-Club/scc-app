import React, {useEffect, useRef, useState, useCallback} from 'react';
import styled from 'styled-components';
import {PlaceListItem} from '@/generated-sources/openapi';
import {MarkerIcon, MarkerLevel} from '@/components/maps/MarkerItem';
import {getMarkerSvg, MarkerColors} from '@/assets/markers';

declare global {
  interface Window {
    naver: any;
  }
}

interface NaverMapViewProps {
  searchResults: PlaceListItem[];
  onMapViewportChange?: (center: {lat: number; lng: number}) => void;
  currentLocation?: {lat: number; lng: number} | null;
  onPlaceClick?: (placeId: string) => void;
  selectedPlaceId?: string; // 외부에서 선택된 장소 ID
}

interface MarkerData {
  placeId: string;
  marker: any;
  infoWindow: any;
  originalContent: string;
}

// 현재 선택된 마커 추적을 위한 ref
let selectedMarkerId: string | null = null;

// 현재 위치 마커를 위한 ref
let currentLocationMarker: any = null;

export default function NaverMapView({
  searchResults,
  onMapViewportChange,
  currentLocation,
  onPlaceClick,
  selectedPlaceId,
}: NaverMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<MarkerData[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // 기본 위치 (강남역)
  const defaultCenter = {lat: 37.4979, lng: 127.0276};

  // 마커가 현재 뷰포트에 보이는지 확인하는 함수
  const isMarkerVisible = useCallback((position: any) => {
    if (!mapInstanceRef.current) return false;

    const bounds = mapInstanceRef.current.getBounds();
    return bounds.hasLatLng(position);
  }, []);

  // 지도 실제 중앙으로 이동하는 함수 (오른쪽 패널 고려)
  const panToCenter = useCallback((position: any) => {
    if (!mapInstanceRef.current) return;

    // 현재 지도 크기 가져오기
    const mapDiv = mapRef.current;
    if (!mapDiv) return;

    const mapWidth = mapDiv.offsetWidth;
    const mapHeight = mapDiv.offsetHeight;

    // 오른쪽에 PlaceDetail 패널이 있는지 확인 (URL에 placeId가 있으면 패널이 열려있음)
    const hasRightPanel = typeof window !== 'undefined' && window.location.pathname.includes('/place/');

    // 오프셋 계산: 패널들을 고려한 실제 지도 중앙 계산
    let offsetX = 0; // 오프셋 없음 - 지도 자체 중앙으로 이동

    // 현재 지도 중심에서 오프셋만큼 이동한 위치 계산
    const currentCenter = mapInstanceRef.current.getCenter();
    const projection = mapInstanceRef.current.getProjection();

    // 지도 좌표를 픽셀로 변환
    const point = projection.fromCoordToOffset(position);

    // 오프셋 적용
    const offsetPoint = new window.naver.maps.Point(point.x + offsetX, point.y);

    // 픽셀을 다시 지도 좌표로 변환
    const offsetPosition = projection.fromOffsetToCoord(offsetPoint);

    // 계산된 위치로 이동
    mapInstanceRef.current.panTo(offsetPosition);
  }, []);

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
        mapTypeControl: false, // 일반/위성 토글 숨김
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

      // 기존 현재 위치 마커 제거
      if (currentLocationMarker) {
        currentLocationMarker.setMap(null);
      }

      // 새로운 현재 위치 마커 생성
      currentLocationMarker = new window.naver.maps.Marker({
        position: newCenter,
        map: mapInstanceRef.current,
        icon: {
          content: `<div style="
            width: 16px;
            height: 16px;
            background: #FF5722;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          "></div>`,
          anchor: new window.naver.maps.Point(8, 8),
        },
        zIndex: 1000, // 다른 마커들보다 위에 표시
      });
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

    // 선택된 마커 상태 초기화
    selectedMarkerId = null;

    // 새 마커들 생성
    const newMarkers: MarkerData[] = searchResults.map(item => {
      const position = new window.naver.maps.LatLng(
        item.place.location?.lat || 0,
        item.place.location?.lng || 0,
      );

      // 카테고리에 따른 마커 아이콘 매핑
      const getMarkerIconType = (category?: string): MarkerIcon => {
        const iconMap: {[key: string]: MarkerIcon} = {
          RESTAURANT: 'rest',
          CAFE: 'cafe',
          CONVENIENCE_STORE: 'conv',
          PHARMACY: 'phar',
          HOSPITAL: 'hos',
        };
        return iconMap[category || ''] || 'default';
      };

      const markerIconType = getMarkerIconType(item.place.category);
      const hasReview = (item.accessibilityInfo?.accessibilityScore || 0) > 0;
      const accessibilityLevel: MarkerLevel = item.accessibilityInfo?.accessibilityScore !== undefined
        ? String(item.accessibilityInfo.accessibilityScore) as MarkerLevel
        : 'none';

      // 기본 마커 SVG 가져오기
      let markerSvg = getMarkerSvg(markerIconType, false, hasReview);

      // 접근성 레벨에 따른 색상 동적 변경
      if (accessibilityLevel !== 'none') {
        const levelColor = MarkerColors[accessibilityLevel];
        // SVG의 fill 색상을 접근성 레벨 색상으로 변경
        markerSvg = markerSvg.replace(/fill="#9A9B9F"/g, `fill="${levelColor}"`);
      }

      const marker = new window.naver.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: item.place.name,
        zIndex: 100, // 기본 zIndex 설정
        icon: {
          content: `<div style="
            position: relative;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              width: 32px;
              height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
            ">${markerSvg}</div>
            <div style="
              background: rgba(255, 255, 255, 0.9);
              padding: 2px 6px;
              font-size: 11px;
              font-weight: 500;
              color: #333;
              white-space: nowrap;
              border-radius: 8px;
              max-width: 100px;
              overflow: hidden;
              text-overflow: ellipsis;
            ">${item.place.name}</div>
          </div>`,
          anchor: new window.naver.maps.Point(16, 34), // 마커 하단 중앙에 위치
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

      // 원본 마커 콘텐츠 저장
      const originalContent = `<div style="
        position: relative;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">${markerSvg}</div>
        <div style="
          background: rgba(255, 255, 255, 0.9);
          padding: 2px 6px;
          font-size: 11px;
          font-weight: 500;
          color: #333;
          white-space: nowrap;
          border-radius: 8px;
          max-width: 100px;
          overflow: hidden;
          text-overflow: ellipsis;
        ">${item.place.name}</div>
      </div>`;

      // 마커 클릭 이벤트
      window.naver.maps.Event.addListener(marker, 'click', () => {
        console.log('마커 클릭됨:', item.place.name, position);

        // 마커가 현재 뷰포트에 보이지 않을 때만 지도를 이동
        if (!isMarkerVisible(position)) {
          console.log('마커가 화면 밖에 있음, 지도 이동 실행');
          panToCenter(position);
        } else {
          console.log('마커가 화면에 보임, 지도 이동 생략');
        }

        // 이전에 선택된 마커가 있다면 원래 상태로 되돌리기
        if (selectedMarkerId && selectedMarkerId !== item.place.id) {
          const prevMarkerData = markersRef.current.find(m => m.placeId === selectedMarkerId);
          if (prevMarkerData) {
            prevMarkerData.marker.setIcon({
              content: prevMarkerData.originalContent,
              anchor: new window.naver.maps.Point(16, 34),
            });
            // 이전 마커의 zIndex를 기본값으로 복원
            prevMarkerData.marker.setZIndex(100);
          }
        }

        // 현재 마커 확대 효과
        let focusedMarkerSvg = getMarkerSvg(markerIconType, true, hasReview);

        // 접근성 레벨에 따른 색상 동적 변경 (클릭 시에도 적용)
        if (accessibilityLevel !== 'none') {
          const levelColor = MarkerColors[accessibilityLevel];
          focusedMarkerSvg = focusedMarkerSvg.replace(/fill="#9A9B9F"/g, `fill="${levelColor}"`);
        }
        const enlargedContent = `<div style="
          position: relative;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transform: scale(1.35);
          transform-origin: center bottom;
        ">
          <div style="
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">${focusedMarkerSvg}</div>
          <div style="
            background: rgba(255, 255, 255, 0.95);
            border-radius: 8px;
            padding: 3px 7px;
            font-size: 12px;
            font-weight: 600;
            color: #333;
            white-space: nowrap;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            max-width: 125px;
            overflow: hidden;
            text-overflow: ellipsis;
          ">${item.place.name}</div>
        </div>`;

        marker.setIcon({
          content: enlargedContent,
          anchor: new window.naver.maps.Point(16, 34), // 중앙 하단 유지
        });

        // 선택된 마커를 가장 앞으로 가져오기
        marker.setZIndex(1000);

        // 선택된 마커 ID 업데이트
        selectedMarkerId = item.place.id;

        // 잠시 후 PlaceDetail로 이동
        setTimeout(() => {
          onPlaceClick?.(item.place.id);
        }, 200);
      });

      return {
        placeId: item.place.id,
        marker,
        infoWindow,
        originalContent,
      };
    });

    markersRef.current = newMarkers;

    // 마커들이 모두 보이도록 지도 범위 조정 (검색 결과 마커만 포함)
    if (newMarkers.length > 0) {
      const bounds = new window.naver.maps.LatLngBounds();
      newMarkers.forEach(({marker}) => {
        bounds.extend(marker.getPosition());
      });

      mapInstanceRef.current.fitBounds(bounds, {
        padding: {top: 60, right: 60, bottom: 60, left: 60},
      });
    }
  }, [searchResults, isMapLoaded, currentLocation]);

  // 외부에서 선택된 장소로 지도 이동 (검색 결과 클릭 시)
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedPlaceId || !isMapLoaded) return;

    // 이미 선택된 마커인 경우 스킵 (마커 클릭 시 중복 방지)
    if (selectedMarkerId === selectedPlaceId) return;

    const targetMarker = markersRef.current.find(m => m.placeId === selectedPlaceId);
    if (targetMarker) {
      console.log('검색 결과에서 선택된 장소로 이동:', selectedPlaceId);

      const markerPosition = targetMarker.marker.getPosition();
      // 마커가 현재 뷰포트에 보이지 않을 때만 지도를 이동
      if (!isMarkerVisible(markerPosition)) {
        console.log('선택된 마커가 화면 밖에 있음, 지도 이동 실행');
        panToCenter(markerPosition);
      } else {
        console.log('선택된 마커가 화면에 보임, 지도 이동 생략');
      }

      // 기존 선택된 마커 초기화
      if (selectedMarkerId && selectedMarkerId !== selectedPlaceId) {
        const prevMarkerData = markersRef.current.find(m => m.placeId === selectedMarkerId);
        if (prevMarkerData) {
          prevMarkerData.marker.setIcon({
            content: prevMarkerData.originalContent,
            anchor: new window.naver.maps.Point(16, 34),
          });
          // 이전 마커의 zIndex를 기본값으로 복원
          prevMarkerData.marker.setZIndex(100);
        }
      }

      // 새로운 마커 선택 효과 적용
      const targetItem = searchResults.find(item => item.place.id === selectedPlaceId);
      if (targetItem) {
        // 마커 아이콘 타입과 접근성 정보 가져오기
        const getMarkerIconType = (category?: string): MarkerIcon => {
          const iconMap: {[key: string]: MarkerIcon} = {
            RESTAURANT: 'rest',
            CAFE: 'cafe',
            CONVENIENCE_STORE: 'conv',
            PHARMACY: 'phar',
            HOSPITAL: 'hos',
          };
          return iconMap[category || ''] || 'default';
        };

        const markerIconType = getMarkerIconType(targetItem.place.category);
        const hasReview = (targetItem.accessibilityInfo?.accessibilityScore || 0) > 0;
        const accessibilityLevel: MarkerLevel = targetItem.accessibilityInfo?.accessibilityScore !== undefined
          ? String(targetItem.accessibilityInfo.accessibilityScore) as MarkerLevel
          : 'none';

        let focusedMarkerSvg = getMarkerSvg(markerIconType, true, hasReview);

        // 접근성 레벨에 따른 색상 동적 변경
        if (accessibilityLevel !== 'none') {
          const levelColor = MarkerColors[accessibilityLevel];
          focusedMarkerSvg = focusedMarkerSvg.replace(/fill="#9A9B9F"/g, `fill="${levelColor}"`);
        }

        const enlargedContent = `<div style="
          position: relative;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transform: scale(1.35);
          transform-origin: center bottom;
        ">
          <div style="
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">${focusedMarkerSvg}</div>
          <div style="
            background: rgba(255, 255, 255, 0.95);
            border-radius: 8px;
            padding: 3px 7px;
            font-size: 12px;
            font-weight: 600;
            color: #333;
            white-space: nowrap;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            max-width: 125px;
            overflow: hidden;
            text-overflow: ellipsis;
          ">${targetItem.place.name}</div>
        </div>`;

        targetMarker.marker.setIcon({
          content: enlargedContent,
          anchor: new window.naver.maps.Point(16, 34),
        });

        // 선택된 마커를 가장 앞으로 가져오기
        targetMarker.marker.setZIndex(1000);

        // 선택된 마커 ID 업데이트
        selectedMarkerId = selectedPlaceId;
      }
    }
  }, [selectedPlaceId, isMapLoaded, searchResults]);

  // 현재 위치로 이동하는 함수
  const moveToCurrentLocation = useCallback(() => {
    if (typeof window !== 'undefined' && window.navigator?.geolocation) {
      window.navigator.geolocation.getCurrentPosition(
        (position: any) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          if (mapInstanceRef.current && typeof window !== 'undefined') {
            const newCenter = new window.naver.maps.LatLng(
              newLocation.lat,
              newLocation.lng,
            );
            mapInstanceRef.current.setCenter(newCenter);
            mapInstanceRef.current.setZoom(16);
          }
        },
        (error: any) => {
          console.error('현재 위치를 가져올 수 없습니다:', error);
        },
        {enableHighAccuracy: true},
      );
    }
  }, []);

  return (
    <MapContainer>
      <MapDiv ref={mapRef} />
      <MyLocationButton onClick={moveToCurrentLocation}>
        <div style={{
          width: '16px',
          height: '16px',
          background: '#FF5722',
          border: '3px solid white',
          borderRadius: '50%',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        }}></div>
      </MyLocationButton>
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
  bottom: 56px;
  right: 16px;
  width: 40px;
  height: 40px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #f5f5f5;
  }

  &:active {
    background: #e5e5e5;
  }
`;
