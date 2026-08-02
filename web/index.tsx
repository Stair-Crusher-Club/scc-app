// MUST be first: patches Dimensions (clamp to 480px frame) + Image before any
// app module evaluates (some read Dimensions.get at module load).
import './setupWebShims';

import React from 'react';
import {createRoot} from 'react-dom/client';

import AppRoot from '../App';
import {syncAppInjectedAuthToStorage} from '@/utils/appWebViewBridge';

import DailyLoginPrompt from './components/DailyLoginPrompt';
import {SCC_APP_AUTH_READY_EVENT} from './hooks/useAppInjectedAuth';

// 앱 웹뷰라면 주입된 로그인 상태를 저장소에 먼저 반영한다. 렌더 전에 해야
// accessToken atom 이 앱 토큰으로 hydrate 되고(익명 부트스트랩 스킵), globalAxios
// 인터셉터가 첫 요청부터 앱 유저로 인증한다. 로그인/로그아웃 후 재주입도 반영한다.
syncAppInjectedAuthToStorage();
window.addEventListener(SCC_APP_AUTH_READY_EVENT, syncAppInjectedAuthToStorage);

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
