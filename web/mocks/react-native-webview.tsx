// Web mock for react-native-webview. WebViewScreen.web.tsx handles webview
// navigation (new tab / same-origin redirect) on web, so this iframe-based
// component is only a defensive fallback for any other importer.
import React from 'react';

const WebView = React.forwardRef<HTMLIFrameElement, {source?: {uri?: string}}>(
  ({source}, ref) =>
    React.createElement('iframe', {
      ref,
      src: source?.uri,
      style: {border: 'none', width: '100%', height: '100%'},
    }),
);

export {WebView};
export default WebView;
