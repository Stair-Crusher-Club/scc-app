import React from 'react';
import {View, ViewStyle} from 'react-native';
import styled from 'styled-components/native';

import {
  SccTouchableOpacity,
  SccTouchableOpacityProps,
} from '@/components/SccTouchableOpacity';
import {font} from '@/constant/font';

/** 배지/태그 공통 껍데기 — 높이·padding·border-radius·font·row 레이아웃의 단일 소스. */

interface BadgeShellBaseProps {
  backgroundColor: string;
  textColor: string;
  /** 테두리 색. 생략하면 테두리 없음. */
  borderColor?: string;
  /** 기본 4px. ScoreLabel(카드) 등 6px 변형에 override. */
  borderRadius?: number;
  /** 좌우 padding override. 기본 6px. */
  paddingHorizontal?: number;
  children: React.ReactNode;
  style?: ViewStyle;
}

/** 터치 불가능한 배지 껍데기 (View 기반). */
export interface BadgeShellViewProps extends BadgeShellBaseProps {
  onPress?: undefined;
}

/** 터치 가능한 배지 껍데기 (SccTouchableOpacity 기반). elementName 필수. */
export interface BadgeShellPressableProps
  extends BadgeShellBaseProps,
    Pick<
      SccTouchableOpacityProps,
      'elementName' | 'logParams' | 'disableLogging'
    > {
  onPress: SccTouchableOpacityProps['onPress'];
}

export type BadgeShellProps = BadgeShellViewProps | BadgeShellPressableProps;

function isPressable(
  props: BadgeShellProps,
): props is BadgeShellPressableProps {
  return props.onPress !== undefined;
}

export function BadgeShell(props: BadgeShellProps) {
  const {
    backgroundColor,
    textColor: _textColor,
    borderColor,
    borderRadius = 4,
    paddingHorizontal = 6,
    children,
    style,
  } = props;

  const shellStyle: ViewStyle = {
    backgroundColor,
    borderRadius,
    paddingHorizontal,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    ...(borderColor ? {borderWidth: 1, borderColor} : {}),
    ...style,
  };

  if (isPressable(props)) {
    const {elementName, logParams, disableLogging, onPress} = props;
    return (
      <SccTouchableOpacity
        elementName={elementName}
        logParams={logParams}
        disableLogging={disableLogging}
        onPress={onPress}
        style={shellStyle}>
        {children}
      </SccTouchableOpacity>
    );
  }

  return <View style={shellStyle}>{children}</View>;
}

/** 배지 내 텍스트 공통 스타일 — font-size/family/line-height의 단일 소스. color는 props로. */
export const BadgeText = styled.Text<{textColor: string}>`
  font-family: ${font.pretendardMedium};
  font-size: 12px;
  line-height: 15.6px;
  color: ${({textColor}) => textColor};
`;
