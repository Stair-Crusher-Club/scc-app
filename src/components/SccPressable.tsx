import React, {forwardRef} from 'react';
/* eslint-disable no-restricted-imports */
import {Pressable, PressableProps, View} from 'react-native';
/* eslint-enable no-restricted-imports */
import {useSccEventLogging} from '@/hooks/useSccEventLogging';

export interface SccPressableProps extends PressableProps {
  elementName: string;
  logParams?: Record<string, any>;
}

export const SccPressable = forwardRef<View, SccPressableProps>(
  ({elementName, logParams, onPress, ...props}, ref) => {
    const {createPressHandler} = useSccEventLogging({
      elementName,
      logParams,
    });

    const handlePress = createPressHandler(onPress);

    return <Pressable ref={ref} onPress={handlePress} {...props} />;
  },
);

SccPressable.displayName = 'SccPressable';

export default SccPressable;
