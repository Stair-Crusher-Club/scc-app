import React, {forwardRef, useImperativeHandle, useRef} from 'react';
import {HostComponent} from 'react-native';

import {
  Commands,
  MapViewManager,
  MapViewProps,
  NativeProps,
} from '@/components/maps/MapViewManager.tsx';
import {Region} from '@/components/maps/Types.tsx';

type LatLng = {
  latitude: number;
  longitude: number;
};

export interface MapViewHandle {
  fitToElements: () => void;
  animateToRegion: (region: Region, padding: number, duration: number) => void;
  animateCamera: (center: LatLng, duration: number) => void;
  setPositionMode: (mode: 'normal' | 'direction' | 'compass') => void;
}

const MapViewComponent = forwardRef<MapViewHandle, MapViewProps>(
  (
    {
      onMarkerPress,
      onCameraIdle,
      initialRegion,
      mapPadding,
      markers,
      selectedItemId,
    },
    ref,
  ) => {
    const mapRef = useRef<React.ComponentRef<HostComponent<NativeProps>>>();

    useImperativeHandle(
      ref,
      () => ({
        fitToElements: () => {
          mapRef.current && Commands.fitToElements(mapRef.current);
        },
        animateCamera: (center: LatLng, duration: number) => {
          mapRef.current &&
            Commands.animateCamera(mapRef.current, {center}, duration);
        },
        animateToRegion: (
          {northEast, southWest}: Region,
          padding: number,
          duration: number,
        ) => {
          mapRef.current &&
            Commands.animateToRegion(
              mapRef.current,
              {northEast, southWest},
              padding,
              duration,
            );
        },
        setPositionMode: (mode: 'normal' | 'direction' | 'compass') => {
          mapRef.current && Commands.setPositionMode(mapRef.current, mode);
        },
      }),
      [mapRef],
    );
    return (
      <MapViewManager
        // @ts-ignore
        ref={mapRef}
        style={{
          position: 'absolute',
          top: 0,
          height: '100%',
          width: '100%',
        }}
        onCameraIdle={onCameraIdle}
        onMarkerPress={onMarkerPress}
        initialRegion={initialRegion}
        mapPadding={mapPadding}
        markers={markers}
        selectedItemId={selectedItemId}
      />
    );
  },
);
export default MapViewComponent;
