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

export function LogViewAndClick({children, elementName, params}: Props) {
  return (
    <LogView elementName={elementName} params={params}>
      <LogClick elementName={elementName} params={params}>
        {children}
      </LogClick>
    </LogView>
  );
}
