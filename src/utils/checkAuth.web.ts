const APP_DOWNLOAD_URL = 'https://link.staircrusher.club/gexs2i';

function showAppInstallPrompt() {
  // eslint-disable-next-line no-alert
  const shouldOpen = window.confirm(
    '이 기능은 계단뿌셔클럽 앱에서 사용할 수 있어요.\n앱을 설치하시겠습니까?',
  );
  if (shouldOpen) {
    window.open(APP_DOWNLOAD_URL, '_blank');
  }
}

export function useCheckAuth() {
  const checkAuth = async (_onAuth: () => void, onFailed?: () => void) => {
    // On web, show app install prompt for auth-guarded actions
    onFailed?.();
    showAppInstallPrompt();
  };

  return checkAuth;
}
