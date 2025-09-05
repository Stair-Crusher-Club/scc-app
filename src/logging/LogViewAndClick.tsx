import React, {ReactElement} from 'react';

import {LogClick} from './LogClick';
import {LogView} from './LogView';

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
 * These components provide both element_view (viewport-based) and element_click (on interaction) logging automatically.
 *
 * Migration guide:
 * - Replace <LogViewAndClick elementName="foo"><TouchableOpacity/></LogViewAndClick>
 * - With <SccTouchableOpacity elementName="foo"/>
 *
 * Benefits of new components:
 * - Intelligent viewport-based element_view logging (only when visible)
 * - No wrapper component overhead
 * - Better performance and memory usage
 * - Consistent API and TypeScript support
 */
export function LogViewAndClick({children, elementName, params}: Props) {
  return (
    <LogView elementName={elementName} params={params}>
      <LogClick elementName={elementName} params={params}>
        {children}
      </LogClick>
    </LogView>
  );
}
