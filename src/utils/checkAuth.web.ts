// Web-specific no-op version of checkAuth
// Since web app uses anonymous authentication by default,
// we skip auth checks and always allow actions

export function useCheckAuth() {
  const checkAuth = async (onAuth: () => void, onFailed?: () => void) => {
    // On web, always allow the action (anonymous users can do everything)
    onAuth();
  };

  return checkAuth;
}
