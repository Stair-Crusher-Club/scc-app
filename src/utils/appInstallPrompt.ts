// Native stub. The app-install / login prompts are web-only DOM modals (see
// appInstallPrompt.web.ts); on native there is nothing to show.
export function showAppInstallPrompt(_message?: string) {}

export function showLoginPrompt(_onConfirm: () => void, _message?: string) {}
