import {useRoute} from '@react-navigation/native';
import {Children, cloneElement, ReactElement} from 'react';

import Logger from '@/logging/Logger';

import {useLogParams} from './LogParamsProvider';

interface Props {
  children: ReactElement<{
    onClick?: (...args: any[]) => any;
    onPress?: (...args: any[]) => any;
  }>;
  elementName: string;
  params?: Record<string, any>;
}

/**
 * @deprecated Use SccTouchableOpacity, SccPressable, SccTouchableHighlight, or SccTouchableWithoutFeedback instead.
 * These components provide both element_view (on mount) and element_click (on interaction) logging automatically.
 * 
 * Migration guide:
 * - Replace <LogClick elementName="foo"><TouchableOpacity/></LogClick>
 * - With <SccTouchableOpacity elementName="foo"/>
 * 
 * Benefits of new components:
 * - Automatic viewport-based element_view logging
 * - No wrapper component overhead
 * - Better TypeScript support
 * - Consistent API across all touchable components
 */
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
