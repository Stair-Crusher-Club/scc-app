import React from 'react';
import {PixelRatio, StyleSheet, Text, TextStyle, ViewStyle} from 'react-native';

import {Color, color} from '@/constant/color';
import {font} from '@/constant/font';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';

type ButtonType = 'regular' | 'text';

interface SccButtonProps {
  type?: ButtonType;
  buttonColor?: Color;
  borderColor?: Color;
  width?: ViewStyle['width'];
  height?: ViewStyle['height'];
  text: string;
  textColor?: Color;
  fontSize?: TextStyle['fontSize'];
  fontFamily?: TextStyle['fontFamily'];
  isDisabled?: boolean;
  style?: ViewStyle;
  onPress?: () => void;
  rightLabel?: string;
  rightLabelColor?: Color;
  rightLabelSize?: TextStyle['fontSize'];
  elementName: string;
  logParams?: Record<string, any>;
}

export const SccButton = ({
  type = 'regular',
  buttonColor,
  borderColor,
  width,
  height,
  text,
  textColor = 'white',
  fontSize = 16,
  fontFamily = font.pretendardRegular,
  isDisabled = false,
  onPress = () => {},
  style = {},
  rightLabel,
  rightLabelColor = 'white',
  rightLabelSize = 14,
  elementName,
  logParams,
}: SccButtonProps) => {
  return (
    <SccTouchableOpacity
      elementName={elementName}
      logParams={{button_text: text, ...logParams}}
      onPress={isDisabled ? () => {} : onPress}
      activeOpacity={isDisabled ? 0.4 : 0.7}
      style={[
        buttonStyles(buttonColor, isDisabled, width, height, borderColor)[type],
        style,
      ]}>
      <Text style={textStyles(textColor, fontSize, fontFamily).text}>
        {text}
      </Text>
      {rightLabel && (
        <Text
          style={[
            textStyles(rightLabelColor, rightLabelSize, font.pretendardMedium)
              .text,
            {position: 'absolute', right: 20},
          ]}>
          {rightLabel}
        </Text>
      )}
    </SccTouchableOpacity>
  );
};

const defaultButton = {
  borderRadius: 20,
  justifyContent: 'center',
  alignItems: 'center',
} as ViewStyle;

const buttonStyles = (
  buttonColor: Color = 'blue50',
  isDisabled: boolean,
  _width: ViewStyle['width'] = 'auto',
  _height: ViewStyle['height'] = 54,
  borderColor?: Color,
) =>
  StyleSheet.create({
    regular: {
      ...defaultButton,
      opacity: isDisabled ? 0.7 : 1,
      width: _width,
      height: _height,
      backgroundColor: color[buttonColor],
      borderWidth: borderColor ? 1 : 0,
      borderColor: borderColor ? color[borderColor] : 'undefined',
    },
    text: {
      ...defaultButton,
    },
  });

const textStyles = (
  textColor: Color,
  _fontSize: TextStyle['fontSize'],
  _fontFamily: TextStyle['fontFamily'],
) =>
  StyleSheet.create({
    text: {
      color: color[textColor],
      fontSize: (_fontSize ?? 0) / PixelRatio.getFontScale(), // 버튼 텍스트를 고정 크기로 설정한다.
      fontFamily: _fontFamily,
    },
  });
