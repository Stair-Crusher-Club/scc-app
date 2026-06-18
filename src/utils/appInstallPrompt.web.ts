// Web-only DOM modal prompting users to install the app for app-only features.
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

export function showAppInstallPrompt(message?: string) {
  if (document.getElementById('app-install-overlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'app-install-overlay';
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
  desc.textContent = message || '계단뿌셔클럽 앱에서 만나요';
  Object.assign(desc.style, {
    fontSize: '14px',
    color: '#6B6E78',
    textAlign: 'center',
    margin: '0 0 12px 0',
    lineHeight: '1.4',
  });

  const installBtn = document.createElement('button');
  installBtn.textContent = '앱으로 열기';
  Object.assign(installBtn.style, {
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
  installBtn.onmouseenter = () => {
    installBtn.style.backgroundColor = '#0a63d1';
  };
  installBtn.onmouseleave = () => {
    installBtn.style.backgroundColor = '#0C76F7';
  };
  installBtn.onclick = () => {
    window.open(buildAppDownloadUrl(), '_blank');
    overlay.remove();
  };

  const dismissLink = document.createElement('span');
  dismissLink.textContent = '웹에서 계속 볼게요';
  Object.assign(dismissLink.style, {
    fontSize: '13px',
    color: '#A0A2AE',
    textDecoration: 'underline',
    textUnderlineOffset: '2px',
    cursor: 'pointer',
    padding: '8px',
  });
  dismissLink.onclick = () => overlay.remove();

  modal.appendChild(icon);
  modal.appendChild(appName);
  modal.appendChild(desc);
  modal.appendChild(installBtn);
  modal.appendChild(dismissLink);
  overlay.appendChild(modal);

  overlay.onclick = e => {
    if (e.target === overlay) overlay.remove();
  };

  document.body.appendChild(overlay);
}
