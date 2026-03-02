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
  trackView?: boolean;
}

export const SccTouchableWithoutFeedback = forwardRef<
  any,
  SccTouchableWithoutFeedbackProps
>(
  (
    {elementName, logParams, disableLogging, trackView, onPress, ...props},
    ref,
  ) => {
    const {createPressHandler} = useSccEventLogging({
      elementName,
      logParams,
      disableLogging,
      trackView,
    });

    const handlePress = createPressHandler(onPress);

    return (
      <TouchableWithoutFeedback ref={ref} onPress={handlePress} {...props} />
    );
  },
);

SccTouchableWithoutFeedback.displayName = 'SccTouchableWithoutFeedback';

export default SccTouchableWithoutFeedback;
