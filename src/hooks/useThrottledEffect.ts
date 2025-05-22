import {useEffect, useRef} from 'react';

type EffectCallback = () => void | Promise<void> | (() => void | Promise<void>);

export function useThrottledEffect(
  effect: EffectCallback,
  deps: React.DependencyList,
  delay: number,
) {
  const timeoutRef = useRef<NodeJS.Timeout>(null);
  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      effect();
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, deps);
}
