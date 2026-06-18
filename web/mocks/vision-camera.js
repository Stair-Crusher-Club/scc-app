// Web mock for react-native-vision-camera.
// CameraScreen is gated behind an app-install prompt on web (route gate never
// mounts it), so these only need to exist so imports resolve.
import React from 'react';
import {View} from 'react-native';

export const Camera = React.forwardRef((props, ref) =>
  React.createElement(View, {ref, ...props}),
);

export class CameraRuntimeError extends Error {}
export class CameraCaptureError extends Error {}

export const getCameraDevice = () => undefined;
export const useCameraDevices = () => [];
export const useCameraDevice = () => undefined;
export const useCameraPermission = () => ({
  hasPermission: false,
  requestPermission: () => Promise.resolve(false),
});

export default {
  Camera,
  CameraRuntimeError,
  CameraCaptureError,
  getCameraDevice,
  useCameraDevices,
  useCameraDevice,
  useCameraPermission,
};
