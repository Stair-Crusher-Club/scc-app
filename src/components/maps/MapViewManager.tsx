import React from 'react';
import {HostComponent} from 'react-native';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

import {MarkerItem} from '@/components/maps/MarkerItem.ts';
import {LatLng, Region} from '@/components/maps/Types.tsx';

export type MapViewProps = {
  markers: (Omit<MarkerItem, 'markerIcon'> | {iconResource: string})[];
  selectedItemId: string | null;
  onMarkerPress?: (event: {nativeEvent: {id: string}}) => void;
  onCameraIdle: (event: {
    nativeEvent: {
      region: Region;
    };
  }) => void;
  initialRegion: Region;
  mapPadding?: {top: number; right: number; bottom: number; left: number};
  style?: {
    position: 'absolute';
    top: number;
    height: string;
    width: string;
  };
};

export type NativeProps = MapViewProps;

interface NativeCommands {
  animateCamera: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    camera: {
      center: LatLng;
    },
    duration: number,
  ) => void;
  fitToElements: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
  ) => void;
  animateToRegion: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    region: Region,
    padding: number,
    duration: number,
  ) => void;
  setPositionMode: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    mode: 'normal' | 'direction' | 'compass',
  ) => void;
}

export const Commands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['animateCamera', 'fitToElements', 'animateToRegion', 'setPositionMode'],
});

export const MapViewManager = codegenNativeComponent<NativeProps>(
  'RNTMapView',
) as HostComponent<NativeProps>;
