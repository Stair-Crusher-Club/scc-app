import React, {forwardRef} from 'react';
/* eslint-disable no-restricted-imports */
import {TouchableOpacity, TouchableOpacityProps} from 'react-native';
/* eslint-enable no-restricted-imports */
import {useOptimizedViewportVisibility} from '@/hooks/useOptimizedViewportVisibility';
import {useSccEventLogging} from '@/hooks/useSccEventLogging';

export interface SccTouchableOpacityProps extends TouchableOpacityProps {
  elementName: string;
  logParams?: Record<string, any>;
}

export const SccTouchableOpacity = forwardRef<any, SccTouchableOpacityProps>(
  ({elementName, logParams, onPress, ...props}, ref) => {
    const {viewRef, hasBeenVisible, checkVisibility} =
      useOptimizedViewportVisibility(0.5);

    const {createPressHandler} = useSccEventLogging({
      elementName,
      logParams,
      hasBeenVisible,
    });

    const handlePress = createPressHandler(onPress);

    return (
      <TouchableOpacity
        ref={node => {
          viewRef.current = node;
          if (ref) {
            if (typeof ref === 'function') {
              ref(node);
            } else {
              ref.current = node;
            }
          }
        }}
        onPress={handlePress}
        onLayout={checkVisibility}
        {...props}
      />
    );
  },
);

SccTouchableOpacity.displayName = 'SccTouchableOpacity';

export default SccTouchableOpacity;
