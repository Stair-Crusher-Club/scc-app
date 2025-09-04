import {useRef, useCallback, useEffect} from 'react';
import {View, Dimensions} from 'react-native';

// Global visibility manager
class ViewportVisibilityManager {
  private static instance: ViewportVisibilityManager;
  private observers = new Map<
    string,
    {
      ref: React.RefObject<View | null>;
      callback: (isVisible: boolean) => void;
      hasBeenVisible: boolean;
      threshold: number;
    }
  >();
  private isChecking = false;
  private checkTimeout: NodeJS.Timeout | null = null;

  static getInstance(): ViewportVisibilityManager {
    if (!ViewportVisibilityManager.instance) {
      ViewportVisibilityManager.instance = new ViewportVisibilityManager();
    }
    return ViewportVisibilityManager.instance;
  }

  register(
    id: string,
    ref: React.RefObject<View | null>,
    callback: (isVisible: boolean) => void,
    threshold = 0.5,
  ) {
    this.observers.set(id, {
      ref,
      callback,
      hasBeenVisible: false,
      threshold,
    });
  }

  unregister(id: string) {
    this.observers.delete(id);
  }

  // Throttled check - only run once per 100ms
  scheduleCheck() {
    if (this.checkTimeout) return;

    this.checkTimeout = setTimeout(() => {
      this.checkAllVisibility();
      this.checkTimeout = null;
    }, 100);
  }

  private async checkAllVisibility() {
    if (this.isChecking) return;
    this.isChecking = true;

    const promises: Promise<void>[] = [];

    this.observers.forEach(observer => {
      // Skip if already visible (performance optimization)
      if (observer.hasBeenVisible) return;

      const promise = new Promise<void>(resolve => {
        if (!observer.ref.current) {
          resolve();
          return;
        }

        observer.ref.current.measureInWindow((x, y, width, height) => {
          if (width === 0 || height === 0) {
            resolve();
            return;
          }

          const {width: screenWidth, height: screenHeight} =
            Dimensions.get('window');

          const visibleWidth =
            Math.min(screenWidth, x + width) - Math.max(0, x);
          const visibleHeight =
            Math.min(screenHeight, y + height) - Math.max(0, y);

          const visibleArea =
            Math.max(0, visibleWidth) * Math.max(0, visibleHeight);
          const totalArea = width * height;
          const visibilityRatio = visibleArea / totalArea;

          const isVisible = visibilityRatio >= observer.threshold;

          if (isVisible && !observer.hasBeenVisible) {
            observer.hasBeenVisible = true;
            observer.callback(true);
          }

          resolve();
        });
      });

      promises.push(promise);
    });

    await Promise.all(promises);
    this.isChecking = false;
  }
}

let componentIdCounter = 0;

export const useOptimizedViewportVisibility = (threshold = 0.5) => {
  const viewRef = useRef<View>(null);
  const componentId = useRef(`viewport-${++componentIdCounter}`).current;
  const hasBeenVisible = useRef(false);
  const manager = ViewportVisibilityManager.getInstance();

  const onVisibilityChange = useCallback((isVisible: boolean) => {
    if (isVisible) {
      hasBeenVisible.current = true;
    }
  }, []);

  const checkVisibility = useCallback(() => {
    manager.scheduleCheck();
  }, [manager]);

  useEffect(() => {
    manager.register(componentId, viewRef, onVisibilityChange, threshold);

    return () => {
      manager.unregister(componentId);
    };
  }, [componentId, manager, onVisibilityChange, threshold]);

  return {
    viewRef,
    hasBeenVisible: hasBeenVisible.current,
    checkVisibility,
  };
};
