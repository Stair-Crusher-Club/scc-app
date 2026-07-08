import React, {useEffect, useState} from 'react';

import {getIsInAppWebView} from '../utils/isInAppWebView';
import {getIsLoggedIn} from '../utils/kakaoAuth';
import {shouldShowDailyLoginPrompt} from '../utils/shouldShowDailyLoginPrompt';

/**
 * web.staircrusher.club 미식별(비회원, 웹뷰 아님) 유저에게 하루 1회 로그인 유도 팝업.
 *
 * 왜 React 컴포넌트로 #root 안에 렌더하는가:
 *   과거엔 document.body 에 오버레이를 수동 append 하고 .onclick / document 위임으로
 *   핸들러를 걸었는데, prod 의 어떤 스크립트가 로드 중 body/document 를 재직렬화·교체해
 *   body 직속 오버레이의 이벤트 핸들러가 통째로 소실됐다(버튼 死, 팝업 안 닫힘).
 *   앱 전체(#root)는 정상 동작하므로 #root 내부는 재직렬화되지 않는다. 팝업을 React
 *   트리(#scc-app-frame 내부) 안에 두고 React 합성 이벤트를 쓰면 그 조작에 영향받지 않는다.
 *   (판정 로직은 shouldShowDailyLoginPrompt 로 DOM 방식과 공유)
 */

const SESSION_KEY = 'loginPromptSessionSeen';
const LAST_SHOWN_KEY = 'loginPromptLastShownDate';
const APP_ICON_URL = new URL('../assets/app-icon.png', import.meta.url).href;

export default function DailyLoginPrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sessionStarted = window.sessionStorage.getItem(SESSION_KEY) === '1';
    // 이번 로드가 이 세션의 첫 판정임을 기록(세션 내 이동은 sessionStarted=true).
    window.sessionStorage.setItem(SESSION_KEY, '1');
    const today = new Date().toDateString(); // 로컬 자정에 롤오버

    const show = shouldShowDailyLoginPrompt({
      inAppWebView: getIsInAppWebView(),
      loggedIn: getIsLoggedIn(),
      sessionStarted,
      pathname: window.location.pathname,
      today,
      lastShownDate: window.localStorage.getItem(LAST_SHOWN_KEY),
    });
    if (!show) return;

    // 빈/로딩 화면 위에 즉시 덮이지 않도록 첫 페인트 뒤로 약간 미룬다.
    // lastShown 은 "실제로 팝업이 뜨는 순간"에만 기록한다 — 판정 통과 즉시 기록하면
    // 800ms 전에 이탈/리다이렉트/언마운트 시 팝업을 못 봤는데도 오늘 쿼터가 소모돼
    // 하루 종일 안 뜬다(유저 리포트 원인).
    const t = window.setTimeout(() => {
      window.localStorage.setItem(LAST_SHOWN_KEY, today);
      setVisible(true);
    }, 800);
    return () => window.clearTimeout(t);
  }, []);

  if (!visible) return null;

  const goLogin = () => {
    const next = window.location.pathname + window.location.search;
    window.location.assign(`/login?redirect=${encodeURIComponent(next)}`);
  };
  const dismiss = () => setVisible(false);

  return (
    <div style={overlayStyle} onClick={dismiss} data-scc-daily-login-prompt="">

      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <img src={APP_ICON_URL} style={iconStyle} alt="" />
        <p style={appNameStyle}>계단뿌셔클럽</p>
        <p style={descStyle}>로그인하고 모든 기능을 이용해보세요</p>
        <button
          type="button"
          style={primaryStyle}
          onClick={goLogin}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              '#0a63d1';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              '#0C76F7';
          }}>
          로그인하기
        </button>
        <span style={dismissStyle} onClick={dismiss}>
          다음에 할게요
        </span>
      </div>
    </div>
  );
}

// 스타일: 기존 appInstallPrompt.web.ts 의 로그인 유도 모달과 동일한 디자인.
// 오버레이는 #scc-app-frame(transform 으로 containing block) 안에 렌더되므로
// position:fixed + inset:0 이면 480px 프레임 기준으로 꽉 찬다(별도 중앙정렬 불필요).
const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 99999,
  animation: 'fadeIn 0.2s ease',
};

const modalStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: 20,
  padding: '36px 28px 28px',
  maxWidth: 320,
  width: '85%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 8,
  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2)',
  animation: 'slideUp 0.25s ease',
};

const iconStyle: React.CSSProperties = {
  width: 80,
  height: 80,
  borderRadius: 20,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  marginBottom: 4,
};

const appNameStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: '#16181C',
  margin: 0,
};

const descStyle: React.CSSProperties = {
  fontSize: 14,
  color: '#6B6E78',
  textAlign: 'center',
  margin: '0 0 12px 0',
  lineHeight: 1.4,
};

const primaryStyle: React.CSSProperties = {
  width: '100%',
  height: 50,
  backgroundColor: '#0C76F7',
  color: '#ffffff',
  border: 'none',
  borderRadius: 14,
  fontSize: 16,
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background-color 0.15s',
  marginBottom: 4,
};

const dismissStyle: React.CSSProperties = {
  fontSize: 13,
  color: '#A0A2AE',
  textDecoration: 'underline',
  textUnderlineOffset: 2,
  cursor: 'pointer',
  padding: 8,
};
