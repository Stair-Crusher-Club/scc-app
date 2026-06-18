import Config from 'react-native-config';

// Web "Sign in with Apple" via Apple's JS SDK (popup). Requires an Apple
// **Service ID** (web client id) registered with this origin's
// `${origin}/oauth/apple` as a Return URL, provided via APPLE_WEB_SERVICE_ID.
export interface AppleWebCredential {
  authorizationCode: string;
  identityToken: string;
}

const APPLE_SDK_SRC =
  'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';

function loadAppleSdk(): Promise<void> {
  const w = window as unknown as {AppleID?: unknown};
  if (w.AppleID) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${APPLE_SDK_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () =>
        reject(new Error('Apple SDK load failed')),
      );
      return;
    }
    const script = document.createElement('script');
    script.src = APPLE_SDK_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Apple SDK load failed'));
    document.head.appendChild(script);
  });
}

export async function appleWebSignIn(): Promise<AppleWebCredential> {
  const serviceId = (Config.APPLE_WEB_SERVICE_ID ?? '').trim();
  if (!serviceId) {
    throw new Error('APPLE_WEB_SERVICE_ID is not configured');
  }
  await loadAppleSdk();
  const AppleID = (window as unknown as {AppleID: any}).AppleID;
  AppleID.auth.init({
    clientId: serviceId,
    scope: 'name email',
    redirectURI: `${window.location.origin}/oauth/apple`,
    usePopup: true,
  });
  const data = await AppleID.auth.signIn();
  return {
    authorizationCode: data?.authorization?.code ?? '',
    identityToken: data?.authorization?.id_token ?? '',
  };
}
