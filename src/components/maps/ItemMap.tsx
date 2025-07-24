import {useRoute} from '@react-navigation/native';
import {useAtomValue} from 'jotai';
import React, {useEffect} from 'react';
import styled from 'styled-components/native';

import {currentLocationAtom} from '@/atoms/Location.ts';
import MapViewComponent, {MapViewHandle} from '@/components/maps/MapView.tsx';
import {MarkerItem} from '@/components/maps/MarkerItem.ts';
import {getRegionFromItems, LatLng, Region} from '@/components/maps/Types.tsx';
import Logger from '@/logging/Logger';
import {
  NativeMarkerItem,
  NativeRegion,
} from '../../../specs/SccMapViewNativeComponent';
import {MarkerColors, getMarkerSvg} from '@/assets/markers';

const DefaultLatitudeDelta = 0.03262934222916414;
const DefaultLongitudeDelta = 0.03680795431138506;

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
}: {
  items: T[];
  onMarkerPress?: (item: T) => void;
  mapRef: React.RefObject<MapViewHandle | null>;
  mapPadding?: {top: number; right: number; bottom: number; left: number};
  selectedItemId: string | null;
  onCameraIdle?: (region: Region) => void;
}) {
  const [firstFittingDone, setFirstFittingDone] = React.useState(false);
  const currentLocation = useAtomValue(currentLocationAtom);
  const region = currentLocation ? getRegion(currentLocation) : DefaultRegion;
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
  const route = useRoute();
  useEffect(() => {
    if (items.length > 0 && !firstFittingDone) {
      setFirstFittingDone(true);
      setTimeout(() => {
        mapRef.current?.animateToRegion(getRegionFromItems(items), 10, 1);
      }, 100);
    }
  }, [items.length]);

  return (
    <StyledMapView
      initialRegion={nativeRegion}
      onMarkerPress={async x => {
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
        onCameraIdle?.({
          northEast: {
            latitude: nativeEvent.northEastLat,
            longitude: nativeEvent.northEastLng,
          },
          southWest: {
            latitude: nativeEvent.southWestLat,
            longitude: nativeEvent.southWestLng,
          },
        });
      }}
      mapPadding={mapPadding}
      markers={nativeMarkerItems}
    />
  );
}

const StyledMapView = styled(MapViewComponent)`
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
`;
