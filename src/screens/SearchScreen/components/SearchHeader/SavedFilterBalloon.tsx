import React, {useEffect, useRef} from 'react';
import {Animated} from 'react-native';
import {useAtomValue, useSetAtom} from 'jotai';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {hasShownSavedFilterTooltipAtom} from '@/atoms/User';
import {useSearchScreenContext} from '@/screens/SearchScreen/SearchScreenContext';

export default function SavedFilterBalloon() {
  const {savedFilterAppliedThisSession: savedFilterApplied} =
    useSearchScreenContext();
  const hasShownTooltip = useAtomValue(hasShownSavedFilterTooltipAtom);
  const setHasShownTooltip = useSetAtom(hasShownSavedFilterTooltipAtom);
  const opacity = useRef(new Animated.Value(0)).current;

  const shouldShow = savedFilterApplied && !hasShownTooltip;

  useEffect(() => {
    if (!shouldShow) {
      return;
    }

    let timer: ReturnType<typeof setTimeout> | null = null;
    let isCancelled = false;

    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (isCancelled) return;
      // 3초 후 fade-out
      timer = setTimeout(() => {
        if (isCancelled) return;
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          if (!isCancelled) {
            setHasShownTooltip(true);
          }
        });
      }, 3000);
    });

    return () => {
      isCancelled = true;
      if (timer) clearTimeout(timer);
      opacity.stopAnimation();
    };
  }, [shouldShow]);

  if (!shouldShow) {
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
        <BalloonText>
          마지막으로 적용했던 필터가 자동으로 적용됐어요!
        </BalloonText>
      </BalloonContainer>
    </Animated.View>
  );
}

const BalloonContainer = styled.View`
  background-color: ${color.brandColor};
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
  background-color: ${color.brandColor};
  transform: rotate(45deg);
  margin-left: 16px;
  margin-bottom: -5px;
`;
