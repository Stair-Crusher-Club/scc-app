import { useRef, useState } from 'react';
import { View, Dimensions } from 'react-native';

export const useViewportVisibility = (threshold = 0.5) => {
  const viewRef = useRef<View>(null);
  const [isVisible, setIsVisible] = useState(false);
  const hasBeenVisible = useRef(false);

  const checkVisibility = () => {
    if (!viewRef.current) return;

    viewRef.current.measureInWindow((x, y, width, height) => {
      const screenHeight = Dimensions.get('window').height;
      const screenWidth = Dimensions.get('window').width;

      // Calculate visible area
      const visibleWidth = Math.min(screenWidth, x + width) - Math.max(0, x);
      const visibleHeight = Math.min(screenHeight, y + height) - Math.max(0, y);
      
      const visibleArea = Math.max(0, visibleWidth) * Math.max(0, visibleHeight);
      const totalArea = width * height;
      
      const visibilityRatio = totalArea > 0 ? visibleArea / totalArea : 0;
      
      const nowVisible = visibilityRatio >= threshold;
      setIsVisible(nowVisible);
      
      // Mark as having been visible (for one-time logging)
      if (nowVisible && !hasBeenVisible.current) {
        hasBeenVisible.current = true;
      }
    });
  };

  return {
    viewRef,
    isVisible,
    hasBeenVisible: hasBeenVisible.current,
    checkVisibility,
  };
};