import SccMapView, {
  NativeProps,
  Commands as SccMapViewCommands,
  SccMapViewType,
} from '@/../specs/SccMapViewNativeComponent';
import {Region} from '@/components/maps/Types.tsx';
import React, {forwardRef, useImperativeHandle, useRef} from 'react';
import {Platform} from 'react-native';

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
  (
    {
      onMarkerPress,
      onCameraIdle,
      initialRegion,
      mapPadding,
      markers,
      circleOverlays,
      rectangleOverlays,
    },
    ref,
  ) => {
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
          if (Platform.OS === 'android') {
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
          } else {
            // FIXME
            //  네이버 지도 SDK에서 안드로이드와 iOS의 duration 단위가 다르다. 안드로이드는 ms, iOS는 seconds.
            //  그래서 iOS인 경우 1000으로 나눈 값을 전달해줘야 하는데, 문제는 현재 bridge interface 상 정수만 들어갈 수 있다.
            //  그래서 ms 단위 애니메이션이 불가능하다.
            //  그래서 iOS만 일단 부득이하게 이미 duration이 네이티브에 150ms로 하드코딩되어 있는 fitToElements()를 사용한다.
            //  네이티브 업데이트 이후 수정 필요.
            mapRef.current && SccMapViewCommands.fitToElements(mapRef.current);
          }
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
