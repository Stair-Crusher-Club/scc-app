import {useRoute} from '@react-navigation/native';
import {useAtomValue} from 'jotai';
import React from 'react';
import styled from 'styled-components/native';

import {getMarkerSvg, MarkerColors} from '@/assets/markers';
import {currentLocationAtom} from '@/atoms/Location.ts';
import {useDevTool} from '@/components/DevTool/useDevTool';
import MapViewComponent, {MapViewHandle} from '@/components/maps/MapView.tsx';
import {MarkerItem} from '@/components/maps/MarkerItem.ts';
import {getRegionCorners, LatLng, Region} from '@/components/maps/Types.tsx';
import Logger from '@/logging/Logger';
import {Platform} from 'react-native';
import {
  NativeCircleOverlay,
  NativeMarkerItem,
  NativeRectangleOverlay,
  NativeRegion,
} from '../../../specs/SccMapViewNativeComponent';

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

export default function ItemMap<T extends MarkerItem>({
  items,
  onMarkerPress,
  mapRef,
  mapPadding,
  selectedItemId,
  onCameraIdle,
  logoPosition,
}: {
  items: T[];
  onMarkerPress?: (item: T) => void;
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
}) {
  const [currentCameraRegion, setCurrentCameraRegion] =
    React.useState<Region | null>(null);
  const currentLocation = useAtomValue(currentLocationAtom);
  const region = currentLocation ? getRegion(currentLocation) : DefaultRegion;
  const devTool = useDevTool();
  const nativeRegion: NativeRegion = {
    northEastLat: region.northEast.latitude,
    northEastLng: region.northEast.longitude,
    southWestLat: region.southWest.latitude,
    southWestLng: region.southWest.longitude,
  };
  const nativeMarkerItems = items.map<NativeMarkerItem>(item => {
    const isSelected = item.id === selectedItemId;
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
      iconColor: MarkerColors[item.markerIcon?.level ?? 'none'],
      zIndex: isSelected ? 99 : 0,
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

  // 모든 마커 합치기
  const allNativeMarkers = [...nativeMarkerItems, ...nativeCornerMarkers];

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

  const route = useRoute();
  return (
    <StyledMapView
      initialRegion={nativeRegion}
      onMarkerPress={async x => {
        // 디버그 귀퉁이 마커는 무시
        if (x.nativeEvent.id.startsWith(CORNER_MARKER_PREFIX)) {
          return;
        }

        const item = items.find(it => it.id === x.nativeEvent.id);
        if (!item) {
          return;
        }
        onMarkerPress?.(item);
        await Logger.logElementClick({
          name: 'search_item_marker',
          currScreenName: route.name,
          extraParams: {
            place_id: item.id,
            place_name: item.displayName,
            place_score_level: item.markerIcon?.level,
          },
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
