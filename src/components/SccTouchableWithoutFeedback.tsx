import React, {forwardRef} from 'react';
/* eslint-disable no-restricted-imports */
import {
  TouchableWithoutFeedback,
  TouchableWithoutFeedbackProps,
} from 'react-native';
/* eslint-enable no-restricted-imports */
import {useSccEventLogging} from '@/hooks/useSccEventLogging';

export interface SccTouchableWithoutFeedbackProps
  extends TouchableWithoutFeedbackProps {
  elementName: string;
  logParams?: Record<string, any>;
}

export const SccTouchableWithoutFeedback = forwardRef<
  any,
  SccTouchableWithoutFeedbackProps
>(({elementName, logParams, onPress, ...props}, ref) => {
  const {createPressHandler} = useSccEventLogging({
    elementName,
    logParams,
  });

  const handlePress = createPressHandler(onPress);

  return (
    <TouchableWithoutFeedback ref={ref} onPress={handlePress} {...props} />
  );
});

SccTouchableWithoutFeedback.displayName = 'SccTouchableWithoutFeedback';

export default SccTouchableWithoutFeedback;
