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
  disableLogging?: boolean;
}

export const SccTouchableWithoutFeedback = forwardRef<
  any,
  SccTouchableWithoutFeedbackProps
>(({elementName, logParams, disableLogging, onPress, ...props}, ref) => {
  const {createPressHandler} = useSccEventLogging({
    elementName,
    logParams,
    disableLogging,
  });

  const handlePress = createPressHandler(onPress);

  return (
    <TouchableWithoutFeedback ref={ref} onPress={handlePress} {...props} />
  );
});

SccTouchableWithoutFeedback.displayName = 'SccTouchableWithoutFeedback';

export default SccTouchableWithoutFeedback;
