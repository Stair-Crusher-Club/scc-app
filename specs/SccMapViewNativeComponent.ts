import type {CodegenTypes, HostComponent, ViewProps} from 'react-native';
import {codegenNativeComponent, codegenNativeCommands} from 'react-native';

export type NativeMarkerItem = {
  id: string;
  markerIcon?: {
    icon: string;
    color: string;
    width: CodegenTypes.Int32;
    height: CodegenTypes.Int32;
  };
  displayName: string;
  location?: {lat: CodegenTypes.Double; lng: CodegenTypes.Double};
};

export type NativeRegion = {
  northEastLat: CodegenTypes.Double;
  northEastLng: CodegenTypes.Double;
  southWestLat: CodegenTypes.Double;
  southWestLng: CodegenTypes.Double;
};

export interface NativeProps extends ViewProps {
  markers: NativeMarkerItem[];
  selectedItemId: string | null;
  onMarkerPress?: CodegenTypes.BubblingEventHandler<{
    id: string;
  }> | null;
  onCameraIdle?: CodegenTypes.BubblingEventHandler<NativeRegion> | null;
  initialRegion: NativeRegion;
  mapPadding?: {
    top: CodegenTypes.Int32;
    right: CodegenTypes.Int32;
    bottom: CodegenTypes.Int32;
    left: CodegenTypes.Int32;
  };
}

export default codegenNativeComponent<NativeProps>(
  'SccMapView',
) as HostComponent<NativeProps>;

export type SccMapViewType = HostComponent<NativeProps>;

interface NativeCommands {
  animateCamera: (
    viewRef: React.ElementRef<SccMapViewType>,
    latitude: CodegenTypes.Double,
    longitude: CodegenTypes.Double,
    duration: CodegenTypes.Int32,
  ) => void;
  fitToElements: (viewRef: React.ElementRef<SccMapViewType>) => void;
  animateToRegion: (
    viewRef: React.ElementRef<SccMapViewType>,
    northEastLat: CodegenTypes.Double,
    northEastLng: CodegenTypes.Double,
    southWestLat: CodegenTypes.Double,
    southWestLng: CodegenTypes.Double,
    padding: CodegenTypes.Int32,
    duration: CodegenTypes.Int32,
  ) => void;
  setPositionMode: (
    viewRef: React.ElementRef<SccMapViewType>,
    mode: string,
  ) => void;
}

export const Commands = codegenNativeCommands<NativeCommands>({
  supportedCommands: [
    'animateCamera',
    'fitToElements',
    'animateToRegion',
    'setPositionMode',
  ],
});
