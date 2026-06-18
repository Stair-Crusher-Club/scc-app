// Web shims that MUST run before any app module evaluates (imported first in
// web/index.tsx). Several screens read `Dimensions.get('window').width` at module
// load to size full-width/paged layouts (e.g. TutorialOverlay, carousels). Since
// the web app is confined to a 480px frame, the real window width (e.g. 1280 on
// desktop) breaks those layouts. Clamp the reported width to the frame width.
import {Dimensions, Image} from 'react-native';

const FRAME_MAX_WIDTH = 480;

// Initialize the Kakao JS SDK with the web Kakao key (the SDK script is loaded
// in index.html). The main login flow uses the REST endpoints, but bbucle-road
// edit mode uses window.Kakao.Auth.
const kakaoWebKey =
  process.env.KAKAO_REST_API_KEY || '1ae6e66e491cf3bf3041015e235c08e1';
const kakaoSdk = (globalThis as {Kakao?: any}).Kakao;
if (kakaoWebKey && kakaoSdk && !kakaoSdk.isInitialized?.()) {
  try {
    kakaoSdk.init(kakaoWebKey);
  } catch (e) {
    // ignore double-init
  }
}

const clampDims = <T extends {width: number; height: number}>(
  dim: string,
  value: T,
): T => {
  if (!value || (dim !== 'window' && dim !== 'screen')) {
    return value;
  }
  const next = {...value};
  if (next.width > FRAME_MAX_WIDTH) {
    next.width = FRAME_MAX_WIDTH;
  }
  // 'screen' height on web is the monitor height; clamp to the viewport so
  // full-height layouts (e.g. tutorial slides) fit the frame, not the monitor.
  const viewportHeight =
    typeof window !== 'undefined' ? window.innerHeight : next.height;
  if (dim === 'screen' && viewportHeight && next.height > viewportHeight) {
    next.height = viewportHeight;
  }
  return next;
};

const origGet = Dimensions.get.bind(Dimensions);
// @ts-ignore - overriding the rn-web Dimensions API
Dimensions.get = (dim: string) => clampDims(dim, origGet(dim as any));

const origAddEventListener = Dimensions.addEventListener.bind(Dimensions);
// @ts-ignore
Dimensions.addEventListener = (type: string, handler: (payload: any) => void) =>
  origAddEventListener(type as any, (payload: any) => {
    if (payload && payload.window) {
      handler({...payload, window: clampDims('window', payload.window)});
    } else {
      handler(payload);
    }
  });

// react-native-web's Image lacks resolveAssetSource(); some screens call it to
// compute aspect ratios. On web a required asset is a URL string — return a sane
// shape so callers don't crash (dimensions are best-effort).
const ImageAny = Image as unknown as {
  resolveAssetSource?: (src: unknown) => {
    uri: string;
    width: number;
    height: number;
  };
};
if (typeof ImageAny.resolveAssetSource !== 'function') {
  ImageAny.resolveAssetSource = (src: unknown) => {
    if (typeof src === 'string') {
      return {uri: src, width: 375, height: 375};
    }
    if (src && typeof src === 'object') {
      const o = src as {
        uri?: string;
        default?: string;
        width?: number;
        height?: number;
      };
      return {
        uri: o.uri ?? o.default ?? '',
        width: o.width ?? 375,
        height: o.height ?? 375,
      };
    }
    return {uri: '', width: 375, height: 375};
  };
}
