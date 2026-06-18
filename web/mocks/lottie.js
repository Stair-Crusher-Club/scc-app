// Web mock for lottie-react-native. Renders an empty View (no animation on web)
// so loading screens / modals that embed a LottieView still mount. Exposes the
// imperative ref API (play/pause/reset/resume) as no-ops so callers don't crash.
import React from 'react';
import {View} from 'react-native';

const LottieView = React.forwardRef((props, ref) => {
  const {source, autoPlay, loop, ...rest} = props;
  React.useImperativeHandle(ref, () => ({
    play: () => {},
    pause: () => {},
    reset: () => {},
    resume: () => {},
  }));
  return React.createElement(View, rest);
});

export default LottieView;
