// Web mock for @sbaiahmed1/react-native-blur (native blur/glass effects).
//
// The native lib blurs whatever is behind the view on the GPU. On web we can
// do the real thing with CSS `backdrop-filter: blur()` — react-native-web
// (0.21) passes `backdropFilter` straight through to the DOM, so the blur is
// actually applied (GPU-accelerated by the browser). We also pass the
// `-webkit-` variant for older Safari. On top of the blur we paint a translucent tint so white overlay
// text stays readable — and that tint alone is a sufficient fallback on the
// rare browser without backdrop-filter support.
import React from 'react';
import {View} from 'react-native';

// blurType → translucent tint, mirroring the native blur's perceived darkness.
// Used as the dim color over the blur (and as the standalone fallback).
const TINT_BY_BLUR_TYPE = {
  light: 'rgba(255, 255, 255, 0.4)',
  xlight: 'rgba(255, 255, 255, 0.6)',
  dark: 'rgba(0, 0, 0, 0.5)',
  extraDark: 'rgba(0, 0, 0, 0.7)',
};

const DEFAULT_TINT = 'rgba(0, 0, 0, 0.5)';

const BlurringView = React.forwardRef(
  ({style, blurType, blurAmount = 10, overlayColor, ...props}, ref) => {
    const tint =
      overlayColor ?? TINT_BY_BLUR_TYPE[blurType] ?? DEFAULT_TINT;
    const radius = Math.max(0, Number(blurAmount) || 0);
    return React.createElement(View, {
      ref,
      ...props,
      style: [
        style,
        {
          backgroundColor: tint,
          backdropFilter: `blur(${radius}px)`,
          WebkitBackdropFilter: `blur(${radius}px)`,
        },
      ],
    });
  },
);

// Plain pass-through grouping containers (no tint/blur of their own).
const Passthrough = React.forwardRef((props, ref) =>
  React.createElement(View, {ref, ...props}),
);

export const BlurView = BlurringView;
export const VibrancyView = BlurringView;
export const ProgressiveBlurView = BlurringView;
export const LiquidGlassView = BlurringView;
export const BlurSwitch = Passthrough;
export const LiquidGlassContainer = Passthrough;

export default {
  BlurView,
  BlurSwitch,
  VibrancyView,
  ProgressiveBlurView,
  LiquidGlassView,
  LiquidGlassContainer,
};
