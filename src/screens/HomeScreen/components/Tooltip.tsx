import {ReactNode} from 'react';
import {StyleSheet, Text, View, ViewProps} from 'react-native';

import {SccPressable} from '@/components/SccPressable';

import CloseIcon from '@/assets/icon/close.svg';
import {color} from '@/constant/color';

interface TooltipProps extends ViewProps {
  visible?: boolean;
  children: ReactNode | string;
  onPressClose?: () => void;
}

export default function Tooltip({
  visible,
  children,
  onPressClose,
  style,
  ...props
}: TooltipProps) {
  const isStringChild = typeof children === 'string';

  if (!visible) {
    return null;
  }

  return (
    <View style={[styles.tooltipContainer, style]} {...props}>
      <View className="bg-[#262626] rounded-lg px-2 py-1.5 relative">
        <SccPressable
          elementName="tooltip_close_button"
          onPress={onPressClose}
          className="absolute top-0 right-0 p-1.5 bg-transparent items-center justify-center z-10">
          <CloseIcon color={color.white} width={16} height={16} />
        </SccPressable>

        {isStringChild ? (
          <Text className="text-white text-[13px] leading-[18px]">
            {children}
          </Text>
        ) : (
          children
        )}
      </View>

      <View style={styles.arrow} />
    </View>
  );
}

const styles = StyleSheet.create({
  tooltipContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  arrow: {
    position: 'absolute',
    bottom: -7,
    left: 30,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#333333',
  },
});
