import {ReactNode} from 'react';
import {Pressable, StyleSheet, Text, View, ViewProps} from 'react-native';

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
      <View style={styles.tooltip}>
        <Pressable onPress={onPressClose} style={styles.closeButton}>
          <CloseIcon color={color.white} width={16} height={16} />
        </Pressable>

        {isStringChild ? (
          <Text style={styles.tooltipText}>{children}</Text>
        ) : (
          children
        )}
      </View>

      <View style={styles.arrow} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  pageContainer: {
    flex: 1,
    position: 'relative',
  },
  title: {
    fontSize: 18,
    color: color.white,
    marginBottom: 20,
    fontWeight: 'normal',
  },
  tooltipContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  tooltip: {
    backgroundColor: '#262626',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 6,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  tooltipText: {
    color: '#ffffff',
    fontSize: 13,
    lineHeight: 18,
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
