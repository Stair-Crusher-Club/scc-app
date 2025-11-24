import React from 'react';
import {PixelRatio, StyleSheet, Text, TextStyle, ViewStyle} from 'react-native';

import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {Color, color} from '@/constant/color';
import {font} from '@/constant/font';

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
  fontWeight?: TextStyle['fontWeight'];
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
  fontWeight = 'normal',
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
      <Text
        style={
          textStyles(isDisabled ? 'gray30' : textColor, fontSize, fontFamily, fontWeight)
            .text
        }>
        {text}
      </Text>
      {rightLabel && (
        <Text
          style={[
            textStyles(
              rightLabelColor,
              rightLabelSize,
              font.pretendardMedium,
              fontWeight,
            ).text,
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
      width: _width,
      height: _height,
      backgroundColor: isDisabled ? color.gray15 : color[buttonColor],
      borderWidth: borderColor ? 1 : 0,
      borderColor: borderColor
        ? isDisabled
          ? color.gray15
          : color[borderColor]
        : 'undefined',
    },
    text: {
      ...defaultButton,
    },
  });

const textStyles = (
  textColor: Color,
  _fontSize: TextStyle['fontSize'],
  _fontFamily: TextStyle['fontFamily'],
  _fontWeight: TextStyle['fontWeight'],
) =>
  StyleSheet.create({
    text: {
      color: color[textColor],
      fontSize: (_fontSize ?? 0) / PixelRatio.getFontScale(), // 버튼 텍스트를 고정 크기로 설정한다.
      fontFamily: _fontFamily,
      fontWeight: _fontWeight,
      lineHeight: ((_fontSize ?? 0) / PixelRatio.getFontScale()) * 1.3,
      includeFontPadding: false, // Android에서 폰트 상하 여백 제거
      textAlignVertical: 'center', // Android에서 텍스트 수직 정렬
    },
  });
