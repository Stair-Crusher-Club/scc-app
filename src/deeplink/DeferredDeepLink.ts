import type {ScreenParams} from '@/navigation/Navigation.screens';

export interface DeepLinkIntent {
  requiresAuth: boolean;
  screen: keyof ScreenParams;
  params: ScreenParams[keyof ScreenParams];
}

let deferredIntent: DeepLinkIntent | null = null;

export function getDeferredDeepLink(): DeepLinkIntent | null {
  return deferredIntent;
}

export function setDeferredDeepLink(intent: DeepLinkIntent | null) {
  deferredIntent = intent;
}
