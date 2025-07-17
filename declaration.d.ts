declare module '*.svg' {
  import React from 'react';
  import {SvgProps} from 'react-native-svg';
  const content: React.FC<SvgProps & {pointColor?: string}>;
  export default content;
}

declare module '*.txt' {
  const content: string;
  export default content;
} 