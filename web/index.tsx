// MUST be first: patches Dimensions (clamp to 480px frame) + Image before any
// app module evaluates (some read Dimensions.get at module load).
import './setupWebShims';

// 이탈 페이지 체류시간 계측 (side-effect import).
// react-navigation 이 로드되기 **전에** history.pushState/replaceState 를 감싸야 하므로
// ../App 보다 먼저 와야 한다. 자세한 배경은 해당 파일 주석 참조.
import './utils/pageDwellTracker';

import React from 'react';
import {createRoot} from 'react-dom/client';

import AppRoot from '../App';
import Logger from '@/logging/Logger';
import {
  readAppInjectedAuth,
  syncAppInjectedAuthToStorage,
} from '@/utils/appWebViewBridge';

import DailyLoginPrompt from './components/DailyLoginPrompt';
import {SCC_APP_AUTH_READY_EVENT} from './hooks/useAppInjectedAuth';

/**
 * 앱 웹뷰라면 주입된 로그인 상태를 저장소에 먼저 반영한다. 렌더 전에 해야
 * accessToken atom 이 앱 토큰으로 hydrate 되고(익명 부트스트랩 스킵), globalAxios
 * 인터셉터가 첫 요청부터 앱 유저로 인증한다. 로그인/로그아웃 후 재주입도 반영한다.
 *
 * GA 신원도 같이 세팅한다. index.html 의 head 스니펫(web/gaBootstrap.js)이 이미
 * 페이지 로드 시점에 주입값을 읽어 심지만, 여기서 한 번 더 부르는 이유가 둘 있다:
 *   1. 웹뷰 안에서 앱 LoginScreen 으로 로그인하면 앱이 **재주입**한다 — 그때 reload 없이 갱신.
 *   2. Android 에서 injectedJavaScriptBeforeContentLoaded 가 head 스크립트보다 늦게
 *      도착하는 경우가 있다. 그 경우 head 스니펫은 신원을 못 읽으므로 여기가 유일한 기회다.
 * (Logger 를 브리지 모듈이 아니라 여기서 부르는 건 순환 import 회피 —
 *  Logger 가 surface 판정 때문에 appWebViewBridge 를 import 한다.)
 */
function applyAppInjectedAuth(): void {
  const auth = readAppInjectedAuth();
  syncAppInjectedAuthToStorage();
  // 주입이 없으면(브라우저) GA 신원은 웹 자체 세션이 소유한다 — 건드리지 않는다.
  if (!auth) return;
  // userId 가 비어 있으면(신앱 로그아웃, 또는 userId 를 안 주입하는 구앱) 아무것도 하지 않는다.
  //
  // ⚠️ 알려진 한계: 웹뷰 안에서 로그아웃해도 **GA 예약 user_id 는 다음 페이지 로드까지 남는다.**
  // 실측으로 확인한 것 — 신원을 심는 신뢰 가능한 경로는 부트스트랩의
  // `gtag('config', ID, {user_id})` 뿐이고(web/gaBootstrap.js), 세션 도중
  // `gtag('set', {user_id: null})` 로는 지워지지 않는다(probe 이벤트가 계속 옛 uid 를 달고 나갔다).
  // 동작하지 않는 "지우기" 코드를 두면 고쳐진 것처럼 보여서 더 위험하므로 넣지 않는다.
  //
  // 영향은 "웹뷰 안 로그아웃 ~ 다음 페이지 로드" 구간으로 한정된다. 다음 로드에선 주입값도
  // 저장소도 비어 있어 신원 없이 config 되고, 저장소 정리는 syncAppInjectedAuthToStorage 가
  // 이미 했으므로 API 인증이 옛 계정으로 남는 일은 없다.
  // (구앱은 애초에 userId 를 주입하지 않으니 이 분기를 로그아웃으로 해석해서도 안 된다.)
  if (auth.userId) {
    Logger.setUserId(auth.userId);
  }
}

applyAppInjectedAuth();
window.addEventListener(SCC_APP_AUTH_READY_EVENT, applyAppInjectedAuth);

// Reset + mobile frame: on desktop the app is capped at 480px, centered, with a
// subtle shadow on the sides so the "mobile" boundary is visible. On narrow
// screens it fills the viewport with no shadow.
const FRAME_CSS = `
  html, body, #root { height: 100%; margin: 0; padding: 0; }
  body { background: #f0f0f0; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  #scc-frame-bg {
    display: flex;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: #f0f0f0;
  }
  #scc-app-frame {
    display: flex;
    flex-direction: column;
    position: relative;
    width: 100%;
    max-width: 480px;
    height: 100%;
    background: #ffffff;
    overflow: hidden;
    box-shadow: 0 0 24px rgba(0, 0, 0, 0.15);
    /* Establish a containing block so position:fixed descendants (e.g. the
       bbucle-road floating bars, overlays) are confined to the 480px frame
       instead of escaping to the viewport. */
    transform: translateZ(0);
  }
  @media (max-width: 480px) {
    #scc-app-frame { box-shadow: none; }
    #scc-frame-bg { background: #ffffff; }
  }
  /* react-native-web's <Modal> portals to body (outside #root), so the 480px
     frame can't clip it. Confine any populated body-level portal to the same
     480px centered box; transform makes it the containing block for the modal's
     fixed overlay. :has(> *) avoids turning empty portal stubs into click traps. */
  body > div:not(#root):has(> *) {
    position: fixed;
    inset: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 480px;
  }
`;

const styleEl = document.createElement('style');
styleEl.textContent = FRAME_CSS;
document.head.appendChild(styleEl);

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);
root.render(
  <div id="scc-frame-bg">
    <div id="scc-app-frame">
      <AppRoot />
      <DailyLoginPrompt />
    </div>
  </div>,
);
