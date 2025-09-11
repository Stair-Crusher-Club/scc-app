import React, {forwardRef} from 'react';
/* eslint-disable no-restricted-imports */
import {TouchableOpacity, TouchableOpacityProps} from 'react-native';
/* eslint-enable no-restricted-imports */
import {useSccEventLogging} from '@/hooks/useSccEventLogging';

export interface SccTouchableOpacityProps extends TouchableOpacityProps {
  elementName: string;
  logParams?: Record<string, any>;
  disableLogging?: boolean;
}

export const SccTouchableOpacity = forwardRef<any, SccTouchableOpacityProps>(
  ({elementName, logParams, disableLogging, onPress, ...props}, ref) => {
    const {createPressHandler} = useSccEventLogging({
      elementName,
      logParams,
      disableLogging,
    });

    const handlePress = createPressHandler(onPress);

    return <TouchableOpacity ref={ref} onPress={handlePress} {...props} />;
  },
);

SccTouchableOpacity.displayName = 'SccTouchableOpacity';

export default SccTouchableOpacity;
