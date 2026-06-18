// Web mock for @sbaiahmed1/react-native-blur (native blur/glass effects).
// Renders a translucent View so overlays still read as a dimmed layer on web.
import React from 'react';
import {View} from 'react-native';

const Passthrough = React.forwardRef((props, ref) =>
  React.createElement(View, {ref, ...props}),
);

export const BlurView = Passthrough;
export const BlurSwitch = Passthrough;
export const VibrancyView = Passthrough;
export const ProgressiveBlurView = Passthrough;
export const LiquidGlassView = Passthrough;
export const LiquidGlassContainer = Passthrough;

export default {
  BlurView,
  BlurSwitch,
  VibrancyView,
  ProgressiveBlurView,
  LiquidGlassView,
  LiquidGlassContainer,
};
