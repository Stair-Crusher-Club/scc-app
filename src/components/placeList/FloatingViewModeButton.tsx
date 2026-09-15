import React from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import styled from 'styled-components/native';

import MapIcon from '@/assets/icon/ic_map.svg';
import MenuIcon from '@/assets/icon/ic_menu.svg';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color';
import {font} from '@/constant/font';

interface FloatingViewModeButtonProps {
  /** 현재 뷰 모드. 'list' 면 지도보기(파랑) 버튼, 'map' 이면 목록보기(흰색) 버튼을 렌더한다. */
  viewMode: 'list' | 'map';
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  elementName: string;
}

export default function FloatingViewModeButton({
  viewMode,
  onPress,
  style,
  elementName,
}: FloatingViewModeButtonProps) {
  const isBlue = viewMode === 'list';
  return (
    <Button
      elementName={elementName}
      activeOpacity={0.8}
      onPress={onPress}
      style={style}
      $isBlue={isBlue}>
      {isBlue ? (
        <MapIcon width={16} height={16} color={color.white} />
      ) : (
        <MenuIcon width={16} height={16} color="#24262B" />
      )}
      <ButtonText $isBlue={isBlue}>
        {isBlue ? '지도보기' : '목록보기'}
      </ButtonText>
    </Button>
  );
}

const Button = styled(SccTouchableOpacity)<{$isBlue: boolean}>`
  position: absolute;
  bottom: 40px;
  align-self: center;
  z-index: 20;
  flex-direction: row;
  align-items: center;
  padding-left: 16px;
  padding-right: 20px;
  padding-vertical: 10px;
  border-radius: 27px;
  background-color: ${({$isBlue}) => ($isBlue ? '#0C76F7' : color.white)};
  gap: 4px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.23;
  shadow-radius: 2px;
  elevation: 8;
`;

const ButtonText = styled.Text<{$isBlue: boolean}>`
  font-family: ${font.pretendardMedium};
  font-size: 15px;
  line-height: 22px;
  letter-spacing: -0.3px;
  color: ${({$isBlue}) => ($isBlue ? color.white : '#24262B')};
`;
