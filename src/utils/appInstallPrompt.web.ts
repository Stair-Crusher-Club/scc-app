// Web-only DOM modals prompting users to install the app (app-only features)
// or to log in (auth-required actions). Both share one modal design.
// Extracted from checkAuth.web.ts so the route gate can reuse it.
const APP_DOWNLOAD_BASE_URL = 'https://link.staircrusher.club/epnb5p';
const APP_ICON_URL = new URL('../../web/assets/app-icon.png', import.meta.url)
  .href;

function getDeepLinkPath(): string | null {
  const path = window.location.pathname;
  const placeListMatch = path.match(/^\/place-list\/([^/]+)/);
  if (placeListMatch) return `place-list/${placeListMatch[1]}`;
  const searchMatch = path.match(/^\/search\/([^/]+)/);
  if (searchMatch) return `search?searchQuery=${searchMatch[1]}`;
  return null;
}

function buildAppDownloadUrl(): string {
  const deepLinkPath = getDeepLinkPath();
  if (!deepLinkPath) return APP_DOWNLOAD_BASE_URL;
  return `${APP_DOWNLOAD_BASE_URL}?deeplink_path=${encodeURIComponent(deepLinkPath)}`;
}

// 앱 설치 유도 / 로그인 유도 공통 모달. 아이콘·앱명·디자인은 동일하고
// 설명 문구·기본 버튼 라벨/동작·하단 dismiss 링크만 다르다.
function showPrompt(opts: {
  message: string;
  primaryLabel: string;
  onPrimary: () => void;
  dismissLabel?: string;
}) {
  if (document.getElementById('app-install-overlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'app-install-overlay';
  // prerender(generate-og-pages.js)가 스냅샷 직전 제거하는 마커. 1일1회 로그인
  // 유도 팝업이 라우트 진입 시 자동으로 떠서 bbucle-road prerender에 박제되면
  // 초기 페인트 깜빡임이 생기므로, 이 클라이언트 전용 오버레이를 스냅샷에서 뺀다.
  overlay.setAttribute('data-scc-daily-login-prompt', '');
  // 오버레이는 body 직속이라 480px 프레임 밖에 놓인다. 프레임과 동일하게 중앙
  // 정렬(left:50% + translateX(-50%) + max-width:480px)해 프레임 위에 덮이게 한다.
  // (이 값을 빼면 web/index.tsx 의 body-portal 규칙의 translateX(-50%) 만 적용돼
  // 모달이 화면 왼쪽 끝(left 0)에 붙어 보인다.)
  Object.assign(overlay.style, {
    position: 'fixed',
    top: '0',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '480px',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '99999',
    animation: 'fadeIn 0.2s ease',
  });

  if (!document.getElementById('app-install-style')) {
    const style = document.createElement('style');
    style.id = 'app-install-style';
    style.textContent = `
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    `;
    document.head.appendChild(style);
  }

  const modal = document.createElement('div');
  Object.assign(modal.style, {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '36px 28px 28px',
    maxWidth: '320px',
    width: '85%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2)',
    animation: 'slideUp 0.25s ease',
  });

  const icon = document.createElement('img');
  icon.src = APP_ICON_URL;
  Object.assign(icon.style, {
    width: '80px',
    height: '80px',
    borderRadius: '20px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    marginBottom: '4px',
  });

  const appName = document.createElement('p');
  appName.textContent = '계단뿌셔클럽';
  Object.assign(appName.style, {
    fontSize: '18px',
    fontWeight: '700',
    color: '#16181C',
    margin: '0',
  });

  const desc = document.createElement('p');
  desc.textContent = opts.message;
  Object.assign(desc.style, {
    fontSize: '14px',
    color: '#6B6E78',
    textAlign: 'center',
    margin: '0 0 12px 0',
    lineHeight: '1.4',
  });

  const primaryBtn = document.createElement('button');
  primaryBtn.textContent = opts.primaryLabel;
  Object.assign(primaryBtn.style, {
    width: '100%',
    height: '50px',
    backgroundColor: '#0C76F7',
    color: '#ffffff',
    border: 'none',
    borderRadius: '14px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
    marginBottom: '4px',
  });
  primaryBtn.onmouseenter = () => {
    primaryBtn.style.backgroundColor = '#0a63d1';
  };
  primaryBtn.onmouseleave = () => {
    primaryBtn.style.backgroundColor = '#0C76F7';
  };
  primaryBtn.onclick = () => {
    overlay.remove();
    opts.onPrimary();
  };

  modal.appendChild(icon);
  modal.appendChild(appName);
  modal.appendChild(desc);
  modal.appendChild(primaryBtn);

  if (opts.dismissLabel) {
    const dismissLink = document.createElement('span');
    dismissLink.textContent = opts.dismissLabel;
    Object.assign(dismissLink.style, {
      fontSize: '13px',
      color: '#A0A2AE',
      textDecoration: 'underline',
      textUnderlineOffset: '2px',
      cursor: 'pointer',
      padding: '8px',
    });
    dismissLink.onclick = () => overlay.remove();
    modal.appendChild(dismissLink);
  }

  overlay.appendChild(modal);

  overlay.onclick = e => {
    if (e.target === overlay) overlay.remove();
  };

  document.body.appendChild(overlay);
}

export function showAppInstallPrompt(message?: string) {
  showPrompt({
    message: message || '계단뿌셔클럽 앱에서 만나요',
    primaryLabel: '앱으로 열기',
    onPrimary: () => window.open(buildAppDownloadUrl(), '_blank'),
    dismissLabel: '웹에서 계속 볼게요',
  });
}

// 로그인 유도 팝업. OK(로그인하기)를 누르면 onConfirm(보통 /login 이동)을 실행한다.
export function showLoginPrompt(onConfirm: () => void, message?: string) {
  showPrompt({
    message: message || '로그인하고 모든 기능을 이용해보세요',
    primaryLabel: '로그인하기',
    onPrimary: onConfirm,
    dismissLabel: '다음에 할게요',
  });
}
