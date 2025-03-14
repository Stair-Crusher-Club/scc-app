import {useRoute} from '@react-navigation/native';
import {Children, cloneElement, ReactElement, useEffect} from 'react';

import Logger from '@/logging/Logger';

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

  /**
   * FIXME: viewport에 노출되었을 때만 로깅하는 게 의도이지만, 빠르게 작업하기 어려워서 일단은 mount시에 로깅하도록 함.
   * FIXME: 로그가 너무 많이 찍힌다... 스크롤할 때마다 찍히는 것 같은데 흠... 첫 list render 시에만 못 찍나?
   */
  useEffect(() => {
    Logger.logElementView({
      name: elementName,
      currScreenName: route.name,
      extraParams: {...globalLogParams, ...params},
    });
  }, []);

  return cloneElement(child);
}
