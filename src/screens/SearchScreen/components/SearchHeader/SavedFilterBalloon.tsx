import React, {useEffect, useRef} from 'react';
import {Animated} from 'react-native';
import {useAtomValue, useSetAtom} from 'jotai';
import styled from 'styled-components/native';

import {font} from '@/constant/font';
import {hasShownSavedFilterTooltipAtom} from '@/atoms/User';
import {savedFilterAppliedThisSessionAtom} from '@/screens/SearchScreen/atoms';

export default function SavedFilterBalloon() {
  const savedFilterApplied = useAtomValue(savedFilterAppliedThisSessionAtom);
  const hasShownTooltip = useAtomValue(hasShownSavedFilterTooltipAtom);
  const setHasShownTooltip = useSetAtom(hasShownSavedFilterTooltipAtom);
  const opacity = useRef(new Animated.Value(0)).current;

  const shouldShow = savedFilterApplied && !hasShownTooltip;

  // TODO: 테스트용 상시 노출 - 테스트 완료 후 제거
  const DEBUG_ALWAYS_SHOW = true;

  useEffect(() => {
    if (DEBUG_ALWAYS_SHOW) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      return;
    }

    if (!shouldShow) {
      return;
    }

    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // 3초 후 fade-out
      setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setHasShownTooltip(true);
        });
      }, 3000);
    });
  }, [shouldShow]);

  if (!DEBUG_ALWAYS_SHOW && !shouldShow) {
    return null;
  }

  return (
    <Animated.View
      style={{
        opacity,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        paddingHorizontal: 20,
      }}
      pointerEvents="none">
      <TailUp />
      <BalloonContainer>
        <BalloonText>마지막으로 적용했던 필터가 자동으로 적용됐어요!</BalloonText>
      </BalloonContainer>
    </Animated.View>
  );
}

const BalloonContainer = styled.View`
  background-color: #262626;
  border-radius: 8px;
  padding: 8px 12px;
  align-self: flex-start;
`;

const BalloonText = styled.Text`
  font-size: 13px;
  font-family: ${font.pretendardMedium};
  color: #ffffff;
`;

const TailUp = styled.View`
  width: 10px;
  height: 10px;
  background-color: #262626;
  transform: rotate(45deg);
  margin-left: 16px;
  margin-bottom: -5px;
`;
