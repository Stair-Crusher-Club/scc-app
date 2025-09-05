import React, {forwardRef} from 'react';
/* eslint-disable no-restricted-imports */
import {TouchableHighlight, TouchableHighlightProps} from 'react-native';
/* eslint-enable no-restricted-imports */
import {useSccEventLogging} from '@/hooks/useSccEventLogging';

export interface SccTouchableHighlightProps extends TouchableHighlightProps {
  elementName: string;
  logParams?: Record<string, any>;
  disableLogging?: boolean;
}

export const SccTouchableHighlight = forwardRef<
  any,
  SccTouchableHighlightProps
>(({elementName, logParams, disableLogging, onPress, ...props}, ref) => {
  const {createPressHandler} = useSccEventLogging({
    elementName,
    logParams,
    disableLogging,
  });

  const handlePress = createPressHandler(onPress);

  return <TouchableHighlight ref={ref} onPress={handlePress} {...props} />;
});

SccTouchableHighlight.displayName = 'SccTouchableHighlight';

export default SccTouchableHighlight;
