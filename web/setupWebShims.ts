// Web shims that MUST run before any app module evaluates (imported first in
// web/index.tsx). Several screens read `Dimensions.get('window').width` at module
// load to size full-width/paged layouts (e.g. TutorialOverlay, carousels). Since
// the web app is confined to a 480px frame, the real window width (e.g. 1280 on
// desktop) breaks those layouts. Clamp the reported width to the frame width.
import {Dimensions, Image} from 'react-native';

const FRAME_MAX_WIDTH = 480;

// Initialize the Kakao JS SDK with the environment-specific JavaScript key (the
// SDK script is loaded in index.html). 로그인 플로우(web/mocks/kakao-login.js)와
// bbucle-road edit mode 모두 이 init 된 JS 키로 window.Kakao.Auth 를 쓴다.
// 환경별 키는 .env 의 KAKAO_JS_KEY (production: prod 앱 JS 키). 이 키의 카카오 앱이
// 해당 환경 백엔드와 같아야 로그인 토큰 aud 가 일치한다.
// 하드코딩 폴백 금지 — 환경별로 키가 달라 폴백을 두면 잘못된 키로 조용히 로그인이
// 깨진다(KOE114). 값은 빌드 시 webpack 이 검증하므로(REQUIRED_ENV_KEYS) 항상 존재한다.
const kakaoWebKey = process.env.KAKAO_JS_KEY;
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
