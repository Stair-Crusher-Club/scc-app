// MUST be first: patches Dimensions (clamp to 480px frame) + Image before any
// app module evaluates (some read Dimensions.get at module load).
import './setupWebShims';

import React from 'react';
import {createRoot} from 'react-dom/client';

import AppRoot from '../App';

// Reset + mobile frame: on desktop the app is capped at 480px, centered, with a
// subtle shadow on the sides so the "mobile" boundary is visible. On narrow
// screens it fills the viewport with no shadow.
const FRAME_CSS = `
  html, body, #root { height: 100%; margin: 0; padding: 0; }
  body { background: #f0f0f0; }
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
    </div>
  </div>,
);
