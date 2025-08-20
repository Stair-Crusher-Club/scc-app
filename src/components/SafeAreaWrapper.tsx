import React from 'react';
import {View, ViewProps} from 'react-native';
import {useSafeAreaInsets, Edge} from 'react-native-safe-area-context';

export interface SafeAreaWrapperProps extends ViewProps {
  children?: React.ReactNode;
  edges?: ReadonlyArray<Edge>;
}

/**
 * 안정적인 SafeArea 래퍼 컴포넌트
 * react-native-safe-area-context의 SafeAreaView 간헐적 오동작 문제를 해결하기 위해
 * useSafeAreaInsets 훅을 사용하여 수동으로 패딩을 적용합니다.
 *
 * React Navigation 팀 권장 방식: https://reactnavigation.org/docs/handling-safe-area/
 */
export const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({
  children,
  edges = ['top', 'bottom', 'left', 'right'],
  style,
  ...props
}) => {
  const insets = useSafeAreaInsets();

  const paddingStyle = {
    paddingTop: edges.includes('top') ? insets.top : 0,
    paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
    paddingLeft: edges.includes('left') ? insets.left : 0,
    paddingRight: edges.includes('right') ? insets.right : 0,
  };

  return (
    <View style={[paddingStyle, style]} {...props}>
      {children}
    </View>
  );
};
