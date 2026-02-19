import type {CodegenTypes, HostComponent, ViewProps} from 'react-native';
import {codegenNativeCommands, codegenNativeComponent} from 'react-native';

export type NativeMarkerItem = {
  id: string;
  position: {lat: CodegenTypes.Double; lng: CodegenTypes.Double};

  captionText?: string;
  captionTextSize?: CodegenTypes.Float;
  isHideCollidedCaptions?: boolean;
  isHideCollidedMarkers?: boolean;
  isHideCollidedSymbols?: boolean;
  iconResource?: string;
  iconColor?: string;
  zIndex?: CodegenTypes.Int32;
};

export type NativeCircleOverlay = {
  id: string;
  center: {lat: CodegenTypes.Double; lng: CodegenTypes.Double};
  radius: CodegenTypes.Double;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: CodegenTypes.Float;
};

export type NativeRectangleOverlay = {
  id: string;
  leftTopLocation: {lat: CodegenTypes.Double; lng: CodegenTypes.Double};
  rightBottomLocation: {lat: CodegenTypes.Double; lng: CodegenTypes.Double};
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: CodegenTypes.Float;
};

export type NativeRegion = {
  northEastLat: CodegenTypes.Double;
  northEastLng: CodegenTypes.Double;
  southWestLat: CodegenTypes.Double;
  southWestLng: CodegenTypes.Double;
};

export type NativeCameraIdleEvent = {
  northEastLat: CodegenTypes.Double;
  northEastLng: CodegenTypes.Double;
  southWestLat: CodegenTypes.Double;
  southWestLng: CodegenTypes.Double;
  zoom: CodegenTypes.Double;
  centerLat: CodegenTypes.Double;
  centerLng: CodegenTypes.Double;
  reason: CodegenTypes.Int32; // 0=gesture, 1=control, 2=location, 3=developer
};

export interface NativeProps extends ViewProps {
  markers: NativeMarkerItem[];
  circleOverlays?: NativeCircleOverlay[];
  rectangleOverlays?: NativeRectangleOverlay[];
  onMarkerPress?: CodegenTypes.BubblingEventHandler<{
    id: string;
  }> | null;
  onCameraIdle?: CodegenTypes.BubblingEventHandler<NativeCameraIdleEvent> | null;
  initialRegion: NativeRegion;
  mapPadding?: {
    top: CodegenTypes.Int32;
    right: CodegenTypes.Int32;
    bottom: CodegenTypes.Int32;
    left: CodegenTypes.Int32;
  };
  /**
   * Position of the Naver logo on the map.
   *
   * @default 'leftBottom'
   *
   * Note: iOS does not support center positions. They will fallback to corner positions:
   * - leftCenter, bottomCenter → leftBottom
   * - rightCenter → rightBottom
   * - topCenter → leftTop
   * ref: https://navermaps.github.io/ios-map-sdk/reference/Enums/NMFLogoAlign.html
   */
  logoPosition?: CodegenTypes.WithDefault<
    | 'leftBottom'
    | 'leftTop'
    | 'leftCenter'
    | 'rightBottom'
    | 'rightTop'
    | 'rightCenter'
    | 'bottomCenter'
    | 'topCenter',
    'leftBottom'
  >;
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
