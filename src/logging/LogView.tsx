import {useRoute} from '@react-navigation/native';
import {useIsFocused} from '@react-navigation/native';
import {Children, cloneElement, ReactElement, useEffect, useRef} from 'react';

import {logElementView} from '@/logging/Logger';

import {useLogParams} from './LogParamsProvider';

interface Props {
  children: ReactElement;
  elementName: string;
  params?: Record<string, any>;
}

export function LogView({children, elementName, params}: Props) {
  const child = Children.only(children);

  const globalLogParams = useLogParams();
  const route = useRoute();
  const isFocused = useIsFocused();
  const hasLoggedRef = useRef(false);

  useEffect(() => {
    if (!isFocused) {
      hasLoggedRef.current = false;
      return;
    }

    if (!hasLoggedRef.current) {
      logElementView({
        name: elementName,
        currScreenName: route.name,
        extraParams: {...globalLogParams, ...params},
      });
      hasLoggedRef.current = true;
    }
  }, [isFocused]);

  return cloneElement(child);
}
