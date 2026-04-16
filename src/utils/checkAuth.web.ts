const APP_DOWNLOAD_URL = 'https://link.staircrusher.club/epnb5p';
const APP_ICON_URL = new URL('../../web/assets/app-icon.png', import.meta.url)
  .href;

function showAppInstallPrompt(message?: string) {
  if (document.getElementById('app-install-overlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'app-install-overlay';
  Object.assign(overlay.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '99999',
    animation: 'fadeIn 0.2s ease',
  });

  // 애니메이션 CSS 주입
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

  // 앱 아이콘 (그림자 + 약간 큰 사이즈)
  const icon = document.createElement('img');
  icon.src = APP_ICON_URL;
  Object.assign(icon.style, {
    width: '80px',
    height: '80px',
    borderRadius: '20px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    marginBottom: '4px',
  });

  // 앱 이름
  const appName = document.createElement('p');
  appName.textContent = '계단뿌셔클럽';
  Object.assign(appName.style, {
    fontSize: '18px',
    fontWeight: '700',
    color: '#16181C',
    margin: '0',
  });

  // 설명 문구
  const desc = document.createElement('p');
  desc.textContent = message || '계단뿌셔클럽 앱에서 만나요';
  Object.assign(desc.style, {
    fontSize: '14px',
    color: '#6B6E78',
    textAlign: 'center',
    margin: '0 0 12px 0',
    lineHeight: '1.4',
  });

  // 설치 버튼
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
    window.open(APP_DOWNLOAD_URL, '_blank');
    overlay.remove();
  };

  // 웹으로 계속 보기
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

export function useCheckAuth() {
  const checkAuth = async (
    _onAuth: () => void,
    onFailed?: () => void,
    message?: string,
  ) => {
    onFailed?.();
    showAppInstallPrompt(message);
  };

  return checkAuth;
}
