// Web mock for @hot-updater/react-native.
// OTA updates are native-only; on web wrap() is an identity HOC so App.tsx
// can stay a single file (no App.web.tsx needed).
export const HotUpdater = {
  // Curried HOC: HotUpdater.wrap(options)(Component) -> Component
  wrap: () => Component => Component,
  getBundleId: () => null,
  reload: () => {},
};

export default {HotUpdater};
