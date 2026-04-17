import React from 'react';
import {TextStyle, ViewStyle} from 'react-native';

import {font} from '@/constant/font';

import {SccButton} from './SccButton';

interface SccSecondaryButtonProps {
  text: string;
  onPress?: () => void;
  isDisabled?: boolean;
  elementName: string;
  logParams?: Record<string, any>;
  style?: ViewStyle;
  width?: ViewStyle['width'];
  height?: ViewStyle['height'];
  fontSize?: TextStyle['fontSize'];
  leftIcon?: React.ComponentType<any>;
  rightIcon?: React.ComponentType<any>;
}

export const SccSecondaryButton = ({
  text,
  onPress,
  isDisabled = false,
  elementName,
  logParams,
  style,
  width,
  height = 56,
  fontSize = 18,
  leftIcon,
  rightIcon,
}: SccSecondaryButtonProps) => {
  return (
    <SccButton
      text={text}
      onPress={onPress}
      isDisabled={isDisabled}
      elementName={elementName}
      logParams={logParams}
      buttonColor="gray20"
      textColor="gray90"
      fontFamily={font.pretendardSemibold}
      fontSize={fontSize}
      width={width}
      height={height}
      leftIcon={leftIcon}
      rightIcon={rightIcon}
      style={{borderRadius: 8, ...style}}
    />
  );
};
