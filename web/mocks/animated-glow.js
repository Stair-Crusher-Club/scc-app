// Web mock for react-native-animated-glow.
//
// The native lib draws an animated glowing border via @shopify/react-native-skia
// (canvaskit-wasm), which can't bundle for web (needs node fs/path, ships a wasm
// blob). On web we degrade gracefully: render children as-is, dropping the glow.
// The wrapped content (e.g. the black recommendation chip) still shows fully.
import React from 'react';
import {View} from 'react-native';

const AnimatedGlow = React.forwardRef(({children, style, ...props}, ref) =>
  React.createElement(View, {ref, style, ...props}, children),
);

export default AnimatedGlow;
