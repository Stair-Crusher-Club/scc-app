import React, {forwardRef} from 'react';
/* eslint-disable no-restricted-imports */
import {Pressable, PressableProps, View} from 'react-native';
/* eslint-enable no-restricted-imports */
import {useOptimizedViewportVisibility} from '@/hooks/useOptimizedViewportVisibility';
import {useSccEventLogging} from '@/hooks/useSccEventLogging';

export interface SccPressableProps extends PressableProps {
  elementName: string;
  logParams?: Record<string, any>;
}

export const SccPressable = forwardRef<View, SccPressableProps>(
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
      <Pressable
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

SccPressable.displayName = 'SccPressable';

export default SccPressable;
