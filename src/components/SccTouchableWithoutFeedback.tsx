import React, {forwardRef, useEffect} from 'react';
/* eslint-disable no-restricted-imports */
import {
  TouchableWithoutFeedback,
  TouchableWithoutFeedbackProps,
} from 'react-native';
/* eslint-enable no-restricted-imports */
import {useRoute} from '@react-navigation/native';
import {useLogParams} from '@/logging/LogParamsProvider';
import Logger from '@/logging/Logger';

export interface SccTouchableWithoutFeedbackProps
  extends TouchableWithoutFeedbackProps {
  elementName: string;
  logParams?: Record<string, any>;
}

export const SccTouchableWithoutFeedback = forwardRef<
  any,
  SccTouchableWithoutFeedbackProps
>(({elementName, logParams, onPress, ...props}, ref) => {
  const globalLogParams = useLogParams();
  const route = useRoute();

  // element_view 로깅 (컴포넌트 마운트 시점에)
  useEffect(() => {
    Logger.logElementView({
      name: elementName,
      currScreenName: route.name,
      extraParams: {...globalLogParams, ...logParams},
    });
  }, []);

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
    <TouchableWithoutFeedback ref={ref} onPress={handlePress} {...props} />
  );
});

SccTouchableWithoutFeedback.displayName = 'SccTouchableWithoutFeedback';

export default SccTouchableWithoutFeedback;
