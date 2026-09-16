import {useIsFocused} from '@react-navigation/native';
import {useAtomValue} from 'jotai';
import React from 'react';
import styled from 'styled-components/native';

import {getMarkerSvg, MarkerColors, ToiletMarkerColor} from '@/assets/markers';
import {currentLocationAtom} from '@/atoms/Location.ts';
import {useDevTool} from '@/components/DevTool/useDevTool';
import MapViewComponent, {MapViewHandle} from '@/components/maps/MapView';
import {MarkerItem} from '@/components/maps/MarkerItem.ts';
import {getRegionCorners, LatLng, Region} from '@/components/maps/Types.tsx';
import {useLogger} from '@/logging/useLogger';
import {Platform} from 'react-native';
import {
  NativeCircleOverlay,
  NativeMarkerItem,
  NativeRectangleOverlay,
  NativeRegion,
} from '../../../specs/SccMapViewNativeComponent';

const ZOOM_CHANGE_THRESHOLD = 0.5;

const DefaultLatitudeDelta = 0.03262934222916414;
const DefaultLongitudeDelta = 0.03680795431138506;

// Corner marker constants
const CORNER_MARKER_PREFIX = 'debug-corner-';

function getRegion({latitude, longitude}: LatLng): Region {
  return {
    northEast: {
      latitude: latitude + DefaultLatitudeDelta / 2,
      longitude: longitude + DefaultLongitudeDelta / 2,
    },
    southWest: {
      latitude: latitude - DefaultLatitudeDelta / 2,
      longitude: longitude - DefaultLongitudeDelta / 2,
    },
  };
}

const SeoulStation = {
  latitude: 37.5559,
  longitude: 126.9723,
};

const DefaultRegion: Region = getRegion(SeoulStation);

/** 서버가 내려준 정복 대상 장소 목록(CTPL) 전용 브랜드 마커. 값은 SVG 원문 문자열. */
export type MarkerIconOverride = {
  defaultSvg: string;
  focusedSvg?: string;
  /**
   * 지정하면 item.markerIcon.level 기반 계산 대신 이 색으로 iconColor 를 고정한다.
   * (예: 미등록 장소를 항상 회색 점으로 — 실제 접근성 점수가 있어도 색이 안 섞이게)
   */
  iconColor?: string;
};

export default function ItemMap<T extends MarkerItem>({
  items,
  overlayMarkers,
  overlaySelectedId,
  onMarkerPress,
  onOverlayMarkerPress,
  mapRef,
  mapPadding,
  selectedItemId,
  onCameraIdle,
  logoPosition,
  markerIconOverride,
}: {
  items: T[];
  overlayMarkers?: MarkerItem[];
  overlaySelectedId?: string | null;
  onMarkerPress?: (item: T) => void;
  onOverlayMarkerPress?: (item: MarkerItem) => void;
  mapRef: React.RefObject<MapViewHandle | null>;
  mapPadding?: {top: number; right: number; bottom: number; left: number};
  selectedItemId: string | null;
  onCameraIdle?: (region: Region) => void;
  logoPosition?:
    | 'leftBottom'
    | 'leftTop'
    | 'leftCenter'
    | 'rightBottom'
    | 'rightTop'
    | 'rightCenter'
    | 'bottomCenter'
    | 'topCenter';
  /**
   * 지정하면 아이템별로 반환값을 판정해 `items` 마커의 iconResource 를 이 SVG 로
   * 덮어쓴다(CTPL 브랜드 핀). 아이템에 대해 undefined 를 반환하면 그 아이템은
   * 기존 getMarkerSvg 로 폴백한다 — 브랜드 핀은 조건에 맞는 아이템에만 적용된다.
   * iconColor 는 그대로 item.markerIcon.level 기준으로 계산한다 — 네이티브가 SVG
   * 안의 플레이스홀더 색(#9A9B9F)을 iconColor 로 치환하므로 정복/미정복 대비가
   * 그대로 따라온다. overlayMarkers(화장실 레이어)에는 적용하지 않는다.
   */
  markerIconOverride?: (item: T) => MarkerIconOverride | undefined;
}) {
  const [currentCameraRegion, setCurrentCameraRegion] =
    React.useState<Region | null>(null);
  const previousZoomRef = React.useRef<number | null>(null);
  const previousCenterRef = React.useRef<{lat: number; lng: number} | null>(
    null,
  );
  const currentLocation = useAtomValue(currentLocationAtom);
  const region = currentLocation ? getRegion(currentLocation) : DefaultRegion;
  const devTool = useDevTool();
  const nativeRegion: NativeRegion = {
    northEastLat: region.northEast.latitude,
    northEastLng: region.northEast.longitude,
    southWestLat: region.southWest.latitude,
    southWestLng: region.southWest.longitude,
  };
  const overlayCount = overlayMarkers?.length ?? 0;
  // Overlay markers (화장실 레이어) — z-index는 항상 place markers보다 낮음
  const nativeOverlayMarkers = (overlayMarkers ?? []).map<NativeMarkerItem>(
    (item, index) => {
      const isSelected = item.id === overlaySelectedId;
      return {
        id: item.id,
        position: {
          lat: item.location?.lat ?? 0,
          lng: item.location?.lng ?? 0,
        },
        captionText: item.displayName,
        captionTextSize: 14,
        isHideCollidedMarkers: false,
        isHideCollidedSymbols: true,
        isHideCollidedCaptions: true,
        iconResource: getMarkerSvg(
          item.markerIcon?.icon ?? 'default',
          isSelected,
          item.hasReview ?? false,
        ),
        iconColor: ToiletMarkerColor,
        zIndex: isSelected
          ? overlayCount + items.length + 2
          : overlayCount - index,
      };
    },
  );

  const nativeMarkerItems = items.map<NativeMarkerItem>((item, index) => {
    const isSelected = item.id === selectedItemId;
    const iconOverride = markerIconOverride?.(item);
    return {
      id: item.id,
      position: {
        lat: item.location?.lat ?? 0,
        lng: item.location?.lng ?? 0,
      },
      captionText: item.displayName,
      captionTextSize: 14,
      isHideCollidedMarkers: false,
      isHideCollidedSymbols: true,
      isHideCollidedCaptions: true,
      iconResource: iconOverride
        ? ((isSelected ? iconOverride.focusedSvg : undefined) ??
          iconOverride.defaultSvg)
        : getMarkerSvg(
            item.markerIcon?.icon ?? 'default',
            isSelected,
            item.hasReview ?? false,
          ),
      iconColor:
        iconOverride?.iconColor ??
        (item.markerIcon?.icon === 'toilet'
          ? ToiletMarkerColor
          : MarkerColors[item.markerIcon?.level ?? 'none']),
      zIndex: isSelected
        ? overlayCount + items.length + 1
        : overlayCount + (items.length - index),
    };
  });

  // DevTool이 활성화되고 현재 카메라 영역이 있을 때 실제 보이는 영역의 귀퉁이 마커 생성
  const nativeCornerMarkers = React.useMemo(() => {
    if (
      !devTool.searchRegion.shouldShow() ||
      !currentCameraRegion ||
      !mapPadding
    ) {
      return [];
    }

    const corners = getRegionCorners(currentCameraRegion);
    return corners.map<NativeMarkerItem>((corner, index) => ({
      id: `${CORNER_MARKER_PREFIX}${index}`,
      position: {
        lat: corner.latitude,
        lng: corner.longitude,
      },
      captionText: `Corner ${index + 1}`,
      captionTextSize: 12,
      isHideCollidedMarkers: false,
      isHideCollidedSymbols: false,
      isHideCollidedCaptions: false,
      iconResource: getMarkerSvg('default', false, false),
      iconColor: '#FF0000', // 빨간색으로 구분
      zIndex: 50, // 일반 마커보다는 높지만 선택된 마커보다는 낮게
    }));
  }, [devTool.searchRegion.data]);

  // 모든 마커 합치기 (overlay → place → debug corner)
  const allNativeMarkers = [
    ...nativeOverlayMarkers,
    ...nativeMarkerItems,
    ...nativeCornerMarkers,
  ];

  // Create native overlays for DevTool
  const nativeCircleOverlays: NativeCircleOverlay[] = [];
  const nativeRectangleOverlays: NativeRectangleOverlay[] = [];

  if (devTool.searchRegion.shouldShow() && devTool.searchRegion.data) {
    if (devTool.searchRegion.data.type === 'circle') {
      nativeCircleOverlays.push({
        id: 'debug-search-radius',
        center: {
          lat: devTool.searchRegion.data.location.lat,
          lng: devTool.searchRegion.data.location.lng,
        },
        radius: devTool.searchRegion.data.radiusMeters,
        fillColor:
          Platform.OS === 'ios' ? 'rgba(66, 165, 245, 0.15)' : '#2042A5F5', // 연한 파란색 배경
        strokeColor:
          Platform.OS === 'ios' ? 'rgba(66, 165, 245, 0.8)' : '#CC42A5F5', // 진한 파란색 테두리
        strokeWidth: 2,
      });
    } else if (devTool.searchRegion.data.type === 'rectangle') {
      nativeRectangleOverlays.push({
        id: 'debug-search-rectangle',
        leftTopLocation: {
          lat: devTool.searchRegion.data.leftTopLocation.lat,
          lng: devTool.searchRegion.data.leftTopLocation.lng,
        },
        rightBottomLocation: {
          lat: devTool.searchRegion.data.rightBottomLocation.lat,
          lng: devTool.searchRegion.data.rightBottomLocation.lng,
        },
        fillColor:
          Platform.OS === 'ios' ? 'rgba(76, 175, 80, 0.15)' : '#2049AF50', // 연한 초록색 배경
        strokeColor:
          Platform.OS === 'ios' ? 'rgba(76, 175, 80, 0.8)' : '#CC4CAF50', // 진한 초록색 테두리
        strokeWidth: 2,
      });
    }
  }

  const isFocused = useIsFocused();
  const logger = useLogger();
  const loggerRef = React.useRef(logger);
  loggerRef.current = logger;

  const loggedPinsRef = React.useRef(new Set<string>());

  React.useEffect(() => {
    if (!isFocused) return;
    items.forEach(item => {
      if (!loggedPinsRef.current.has(item.id)) {
        loggedPinsRef.current.add(item.id);
        loggerRef.current.logElementView('search_item_marker', {
          place_id: item.id,
          place_name: item.displayName,
        });
      }
    });
  }, [items, isFocused]);

  return (
    <StyledMapView
      initialRegion={nativeRegion}
      onMarkerPress={async x => {
        // 디버그 귀퉁이 마커는 무시
        if (x.nativeEvent.id.startsWith(CORNER_MARKER_PREFIX)) {
          return;
        }

        // overlay marker (화장실 레이어) 클릭 분기
        const overlayItem = overlayMarkers?.find(
          it => it.id === x.nativeEvent.id,
        );
        if (overlayItem) {
          onOverlayMarkerPress?.(overlayItem);
          await logger.logElementClick('toilet_layer_marker', {
            external_accessibility_id: overlayItem.id,
            place_name: overlayItem.displayName,
          });
          return;
        }

        const item = items.find(it => it.id === x.nativeEvent.id);
        if (!item) {
          return;
        }
        onMarkerPress?.(item);
        await logger.logElementClick('search_item_marker', {
          place_id: item.id,
          place_name: item.displayName,
          place_score_level: item.markerIcon?.level,
        });
      }}
      ref={mapRef}
      onCameraIdle={({nativeEvent}) => {
        const newRegion = {
          northEast: {
            latitude: nativeEvent.northEastLat,
            longitude: nativeEvent.northEastLng,
          },
          southWest: {
            latitude: nativeEvent.southWestLat,
            longitude: nativeEvent.southWestLng,
          },
        };
        setCurrentCameraRegion(newRegion);
        onCameraIdle?.(newRegion);

        // reason: 0=gesture, 1=control, 2=location, 3=developer
        if (nativeEvent.reason !== 0) {
          previousZoomRef.current = nativeEvent.zoom;
          previousCenterRef.current = {
            lat: nativeEvent.centerLat,
            lng: nativeEvent.centerLng,
          };
          return;
        }

        const currentZoom = nativeEvent.zoom;
        const previousZoom = previousZoomRef.current;

        const latDelta = nativeEvent.northEastLat - nativeEvent.southWestLat;
        const visibleRangeM = Math.round(latDelta * 111320);

        let eventName: string;
        if (previousZoom !== null) {
          const zoomDiff = currentZoom - previousZoom;
          if (zoomDiff > ZOOM_CHANGE_THRESHOLD) {
            eventName = 'map_zoom_in';
          } else if (zoomDiff < -ZOOM_CHANGE_THRESHOLD) {
            eventName = 'map_zoom_out';
          } else {
            eventName = 'map_camera_move';
          }
        } else {
          eventName = 'map_camera_move';
        }

        logger.logElementClick(eventName, {
          before_center_lat: previousCenterRef.current?.lat,
          before_center_lng: previousCenterRef.current?.lng,
          after_center_lat: nativeEvent.centerLat,
          after_center_lng: nativeEvent.centerLng,
          before_zoom: previousZoom,
          after_zoom: currentZoom,
          visible_range_m: visibleRangeM,
        });

        previousZoomRef.current = currentZoom;
        previousCenterRef.current = {
          lat: nativeEvent.centerLat,
          lng: nativeEvent.centerLng,
        };
      }}
      mapPadding={mapPadding}
      markers={allNativeMarkers}
      circleOverlays={nativeCircleOverlays}
      rectangleOverlays={nativeRectangleOverlays}
      logoPosition={logoPosition}
    />
  );
}

const StyledMapView = styled(MapViewComponent)`
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
`;
