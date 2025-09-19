import {useEffect} from 'react';

export function useGlobalKeyboard(
  key: string,
  modifiers: {
    alt?: boolean;
    ctrl?: boolean;
    meta?: boolean;
    shift?: boolean;
  },
  callback: () => void,
  options?: {
    preventDefault?: boolean;
    stopPropagation?: boolean;
    priority?: 'high' | 'normal';
  },
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input field (unless high priority)
      if (options?.priority !== 'high') {
        const target = e.target as HTMLElement;
        if (
          target &&
          (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.contentEditable === 'true')
        ) {
          return;
        }
      }

      const isAltPressed = modifiers.alt ? e.altKey : !e.altKey;
      const isCtrlPressed = modifiers.ctrl ? e.ctrlKey : !e.ctrlKey;
      const isMetaPressed = modifiers.meta ? e.metaKey : !e.metaKey;
      const isShiftPressed = modifiers.shift ? e.shiftKey : !e.shiftKey;

      if (
        e.key === key &&
        isAltPressed &&
        isCtrlPressed &&
        isMetaPressed &&
        isShiftPressed
      ) {
        // Enhanced event prevention for desktop app conflicts
        if (options?.preventDefault !== false) {
          e.preventDefault();
        }
        if (options?.stopPropagation !== false) {
          e.stopPropagation();
          e.stopImmediatePropagation();
        }

        // Additional prevention for problematic shortcuts
        if (modifiers.alt && key === ' ') {
          // Extra prevention for Alt+Space conflicts
          e.returnValue = false;
        }

        callback();
        return false;
      }
    };

    // Use capture phase with high priority to intercept before desktop apps
    const useCapture = true;
    const eventOptions = {capture: useCapture, passive: false};

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown, eventOptions);
      return () =>
        window.removeEventListener('keydown', handleKeyDown, eventOptions);
    }

    return () => {};
  }, [key, modifiers, callback, options]);
}
