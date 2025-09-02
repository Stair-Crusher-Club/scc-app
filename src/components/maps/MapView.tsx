import React, {forwardRef, useImperativeHandle, useRef} from 'react';
import SccMapView, {
  NativeProps,
  Commands as SccMapViewCommands,
  SccMapViewType,
} from '@/../specs/SccMapViewNativeComponent';
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

const MapViewComponent = forwardRef<MapViewHandle, NativeProps>(
  ({onMarkerPress, onCameraIdle, initialRegion, mapPadding, markers, circleOverlays, rectangleOverlays}, ref) => {
    const mapRef = useRef<React.ComponentRef<SccMapViewType> | null>(null);

    useImperativeHandle(
      ref,
      () => ({
        fitToElements: () => {
          mapRef.current && SccMapViewCommands.fitToElements(mapRef.current);
        },
        animateCamera: (center: LatLng, duration: number) => {
          mapRef.current &&
            SccMapViewCommands.animateCamera(
              mapRef.current,
              center.latitude,
              center.longitude,
              duration,
            );
        },
        animateToRegion: (
          {northEast, southWest}: Region,
          padding: number,
          duration: number,
        ) => {
          mapRef.current &&
            SccMapViewCommands.animateToRegion(
              mapRef.current,
              northEast.latitude,
              northEast.longitude,
              southWest.latitude,
              southWest.longitude,
              padding,
              duration,
            );
        },
        setPositionMode: (mode: 'normal' | 'direction' | 'compass') => {
          mapRef.current &&
            SccMapViewCommands.setPositionMode(mapRef.current, mode);
        },
      }),
      [mapRef],
    );
    return (
      <SccMapView
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
        circleOverlays={circleOverlays}
        rectangleOverlays={rectangleOverlays}
      />
    );
  },
);
export default MapViewComponent;
