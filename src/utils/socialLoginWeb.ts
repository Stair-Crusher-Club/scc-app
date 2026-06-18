// Native stub — web Apple Sign In lives in socialLoginWeb.web.ts.
export interface AppleWebCredential {
  authorizationCode: string;
  identityToken: string;
}

export async function appleWebSignIn(): Promise<AppleWebCredential> {
  throw new Error('appleWebSignIn is web-only');
}
