import {useRoute} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {useRecoilValue} from 'recoil';
import styled from 'styled-components/native';

import {currentLocationAtom} from '@/atoms/Location.ts';
import MapViewComponent, {MapViewHandle} from '@/components/maps/MapView.tsx';
import {MarkerItem, toStringMarkerIcon} from '@/components/maps/MarkerItem.ts';
import {getRegionFromItems, LatLng, Region} from '@/components/maps/Types.tsx';
import Logger from '@/logging/Logger';

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
  mapRef: React.RefObject<MapViewHandle>;
  mapPadding?: {top: number; right: number; bottom: number; left: number};
  selectedItemId: string | null;
  onCameraIdle?: (region: Region) => void;
}) {
  const [firstFittingDone, setFirstFittingDone] = React.useState(false);
  const currentLocation = useRecoilValue(currentLocationAtom);
  const route = useRoute();
  useEffect(() => {
    if (items.length > 0 && !firstFittingDone) {
      setFirstFittingDone(true);
      const region = getRegionFromItems(items);
      setTimeout(() => {
        mapRef.current?.animateToRegion(region, 10, 1);
      }, 100);
    }
  }, [items.length]);

  return (
    <StyledMapView
      initialRegion={
        currentLocation ? getRegion(currentLocation) : DefaultRegion
      }
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
        const {region} = nativeEvent;
        onCameraIdle?.(region);
      }}
      mapPadding={mapPadding}
      selectedItemId={selectedItemId}
      markers={items.map(item => ({
        id: item.id,
        iconResource: toStringMarkerIcon(item.markerIcon),
        displayName: item.displayName,
        location: item.location,
      }))}
    />
  );
}

const StyledMapView = styled(MapViewComponent)`
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
`;
