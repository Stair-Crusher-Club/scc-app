import {useRoute} from '@react-navigation/native';
import {Children, cloneElement, ReactElement} from 'react';

import Logger from '@/logging/Logger';

import {useLogParams} from './LogParamsProvider';

interface Props {
  children: ReactElement;
  elementName: string;
  params?: Record<string, any>;
}

export function LogClick({children, elementName, params}: Props) {
  const child = Children.only(children);

  const globalLogParams = useLogParams();
  const route = useRoute();

  return cloneElement(child, {
    onClick: (...args: any[]) => {
      let result = null;
      Logger.logElementClick({
        name: elementName,
        currScreenName: route.name,
        extraParams: {...globalLogParams, ...params},
      });
      if (child.props && typeof child.props.onClick === 'function') {
        result = child.props.onClick(...args);
      }
      return result;
    },
    onPress: (...args: any[]) => {
      let result = null;
      Logger.logElementClick({
        name: elementName,
        currScreenName: route.name,
        extraParams: {...globalLogParams, ...params},
      });
      if (child.props && typeof child.props.onPress === 'function') {
        result = child.props.onPress(...args);
      }
      return result;
    },
  });
}
