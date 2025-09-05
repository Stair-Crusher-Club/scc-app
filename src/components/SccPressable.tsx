import React, {forwardRef, useEffect} from 'react';
/* eslint-disable no-restricted-imports */
import {Pressable, PressableProps, View} from 'react-native';
/* eslint-enable no-restricted-imports */
import {useRoute} from '@react-navigation/native';
import {useLogParams} from '@/logging/LogParamsProvider';
import {useOptimizedViewportVisibility} from '@/hooks/useOptimizedViewportVisibility';
import Logger from '@/logging/Logger';

export interface SccPressableProps extends PressableProps {
  elementName: string;
  logParams?: Record<string, any>;
}

export const SccPressable = forwardRef<View, SccPressableProps>(
  ({elementName, logParams, onPress, ...props}, ref) => {
    const globalLogParams = useLogParams();
    const route = useRoute();
    const {viewRef, hasBeenVisible, checkVisibility} =
      useOptimizedViewportVisibility(0.5);

    // element_view 로깅 (viewport에 노출됐을 때 한 번만)
    useEffect(() => {
      if (hasBeenVisible) {
        Logger.logElementView({
          name: elementName,
          currScreenName: route.name,
          extraParams: {...globalLogParams, ...logParams},
        });
      }
    }, [hasBeenVisible]);

    const handlePress = (event: any) => {
      // element_click 로깅 (매번)
      Logger.logElementClick({
        name: elementName,
        currScreenName: route.name,
        extraParams: {...globalLogParams, ...logParams},
      });

      // 원본 onPress 실행
      if (onPress) {
        onPress(event);
      }
    };

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
