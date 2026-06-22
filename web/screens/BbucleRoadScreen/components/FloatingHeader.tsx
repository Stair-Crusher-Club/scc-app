import React, { useCallback, useState } from 'react';
import { View, Text, LayoutChangeEvent } from 'react-native';
import styled from 'styled-components/native';

import { color } from '@/constant/color';
import { SccPressable } from '@/components/SccPressable';
import IcArrowBack from '@/assets/icon/ic_v2_arrow_back.svg';
import { useResponsive } from '../context/ResponsiveContext';
import LoginButton from '../../../components/LoginButton';
import { getIsInAppWebView } from '../../../utils/isInAppWebView';

interface FloatingHeaderProps {
  title: string;
  onBackPress?: () => void;
}

export default function FloatingHeader({
  title,
  onBackPress,
}: FloatingHeaderProps) {
  const { isDesktop } = useResponsive();
  const isInApp = getIsInAppWebView();

  // 좌(백버튼)·우(로그인/스페이서) 영역의 실제 폭을 측정해, 둘 중 큰 값을 타이틀의
  // 양쪽 inset 으로 준다. 타이틀은 헤더 바 전체를 덮는 절대배치 레이어에서 중앙정렬되며,
  // inset 이 양쪽 대칭이므로 버튼/백버튼 폭·폰트·버튼 텍스트('로그인'↔'로그아웃')가
  // 무엇이든 항상 헤더 바의 기하학적 정중앙에 온다. (매직넘버 없음)
  const [leftWidth, setLeftWidth] = useState(0);
  const [rightWidth, setRightWidth] = useState(0);
  const sideInset = Math.max(leftWidth, rightWidth);

  const onLeftLayout = useCallback(
    (e: LayoutChangeEvent) => setLeftWidth(e.nativeEvent.layout.width),
    [],
  );
  const onRightLayout = useCallback(
    (e: LayoutChangeEvent) => setRightWidth(e.nativeEvent.layout.width),
    [],
  );

  return (
    <Container isDesktop={isDesktop}>
      <ContentWrapper isDesktop={isDesktop}>
        <Side edge="left" isDesktop={isDesktop} onLayout={onLeftLayout}>
          <SccPressable
            elementName="floating-header-back-button"
            logParams={{ title }}
            onPress={onBackPress}>
            <IconWrapper>
              <IcArrowBack width={24} height={24} color={color.black} />
            </IconWrapper>
          </SccPressable>
        </Side>

        <TitleLayer pointerEvents="none" style={{ left: sideInset, right: sideInset }}>
          <Title isDesktop={isDesktop} numberOfLines={1} ellipsizeMode="tail">
            {title}
          </Title>
        </TitleLayer>

        {/* 우측: 웹은 로그인/로그아웃 버튼, 앱 webview 면 비어있다(스페이서로 좌측과 폭 대칭). */}
        <Side edge="right" isDesktop={isDesktop} onLayout={onRightLayout}>
          {isInApp ? (
            <IconPlaceholder />
          ) : (
            <LoginButton location="detail-header" />
          )}
        </Side>
      </ContentWrapper>
    </Container>
  );
}

const Container = styled(View)<{ isDesktop: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 200;
  background-color: ${color.white};
`;

const ContentWrapper = styled(View)<{ isDesktop: boolean }>`
  position: relative;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  max-width: ${({ isDesktop }) => (isDesktop ? '1020px' : '100%')};
  width: 100%;
  align-self: center;
  padding: 15px 0px;
`;

// 좌/우 영역 — 내용(백버튼 / 로그인 버튼) + 가장자리 padding 까지 포함해 폭을 측정한다.
// 가장자리 padding 을 ContentWrapper 가 아니라 여기에 둬서, onLayout 으로 잰 폭이
// "바 가장자리 ~ 버튼 안쪽 끝" 거리를 그대로 담는다 → 그 폭을 타이틀 inset 으로 쓰면
// 버튼과 겹치지 않으면서 정중앙 정렬이 된다.
const Side = styled(View)<{ edge: 'left' | 'right'; isDesktop: boolean }>`
  flex-direction: row;
  align-items: center;
  ${({ edge, isDesktop }) =>
    isDesktop
      ? ''
      : edge === 'left'
      ? 'padding-left: 16px;'
      : 'padding-right: 16px;'}
`;

// 타이틀 레이어 — 헤더 바 전체 높이를 덮는 절대배치. left/right inset 은 인라인으로 주입.
// pointerEvents none 으로 뒤(백버튼/로그인 버튼)의 탭을 막지 않는다.
const TitleLayer = styled(View)`
  position: absolute;
  top: 0;
  bottom: 0;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const IconWrapper = styled(View)`
  width: 24px;
  height: 24px;
  justify-content: center;
  align-items: center;
`;

const IconPlaceholder = styled(View)`
  width: 24px;
  height: 24px;
`;

const Title = styled(Text)<{ isDesktop: boolean }>`
  flex: 1;
  font-family: Pretendard;
  font-size: 22px;
  font-weight: 600;
  color: ${color.black};
  letter-spacing: -0.44px;
  line-height: 30px;
  text-align: center;
`;
