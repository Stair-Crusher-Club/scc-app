// Web mock for react-native-root-toast
class Toast {
  static show(message, options = {}) {
    // Create a simple toast element
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 50px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 10000;
      pointer-events: none;
    `;

    document.body.appendChild(toast);

    // Remove after duration
    const duration = options.duration || Toast.durations.SHORT;
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, duration);

    return toast;
  }

  static durations = {
    SHORT: 2000,
    LONG: 3500,
  };

  static positions = {
    TOP: 'top',
    BOTTOM: 'bottom',
    CENTER: 'center',
  };
}

export default Toast;