import React, {forwardRef} from 'react';
/* eslint-disable no-restricted-imports */
import {Pressable, PressableProps, View} from 'react-native';
/* eslint-enable no-restricted-imports */
import {useSccEventLogging} from '@/hooks/useSccEventLogging';

export interface SccPressableProps extends PressableProps {
  elementName: string;
  logParams?: Record<string, any>;
  disableLogging?: boolean;
}

export const SccPressable = forwardRef<View, SccPressableProps>(
  ({elementName, logParams, disableLogging, onPress, ...props}, ref) => {
    const {createPressHandler} = useSccEventLogging({
      elementName,
      logParams,
      disableLogging,
    });

    const handlePress = createPressHandler(onPress);

    return <Pressable ref={ref} onPress={handlePress} {...props} />;
  },
);

SccPressable.displayName = 'SccPressable';

export default SccPressable;
