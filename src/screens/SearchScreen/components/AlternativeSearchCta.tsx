import React, {useEffect, useState} from 'react';
import {AccessibilityInfo} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import styled from 'styled-components/native';

import ChevronRightIcon from '@/assets/icon/ic_chevron_right.svg';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color.ts';
import {font} from '@/constant/font.ts';
import {AlternativeSearchSuggestionDto} from '@/generated-sources/openapi';
import {useAlternativeSearchSuggestion} from '@/screens/SearchScreen/useAlternativeSearchSuggestion';

/**
 * CTA 유무와 무관하게 항상 확보하는 높이. 카드가 위아래로 흔들리지 않게 한다.
 */
const SLOT_HEIGHT = 56;

/**
 * "접근 가능"으로 보는 접근레벨의 상한. 0=계단 없음, 1=경사로 있음, 2=계단 1개.
 * 검색 결과에 이 이하가 하나도 없을 때가 대체 검색을 제안할 상황(부정경험)이다.
 */
export const GOOD_ACCESSIBILITY_MAX_SCORE = 2;

const ENTER_DURATION_MS = 220;
const EXIT_DURATION_MS = 140;
// 오버슈트·바운스 금지 — "툭 튀어나오는" 느낌이 나면 안 된다.
const ENTER_EASING = Easing.bezier(0.2, 0, 0, 1);
const EXIT_EASING = Easing.out(Easing.ease);

/**
 * 포커스된 카드 위에 뜨는 "주위 다른 OOO 확인하기" 버튼.
 *
 * 슬롯은 제안 유무와 무관하게 항상 렌더된다 (높이 고정). 제안이 오기 전/스크롤 중에는
 * 버튼만 투명하게 빠진다 — 로딩 인디케이터는 두지 않는다.
 */
export default function AlternativeSearchCta({
  focusedPlaceId,
  isScrolling,
  currentSearchText,
  isEnabled,
  onPress,
}: {
  focusedPlaceId: string | null;
  isScrolling: boolean;
  currentSearchText: string | null;
  isEnabled: boolean;
  onPress: (suggestion: AlternativeSearchSuggestionDto) => void;
}) {
  const {isActive, suggestion} = useAlternativeSearchSuggestion({
    focusedPlaceId,
    currentSearchText,
    isEnabled,
  });
  // 이번 검색에서 CTA가 뜰 여지가 없으면 슬롯 자리도 잡지 않는다.
  // (화장실 검색·접근 가능한 결과가 이미 있는 검색에서 카드가 아래로 밀리면 안 된다)
  if (!isActive) return null;

  // 스크롤이 시작되면 결과와 무관하게 즉시 숨긴다.
  const isVisible = !!suggestion && !isScrolling;

  return (
    <Slot pointerEvents="box-none">
      {/* 카드가 바뀌면 라벨이 같더라도 퇴장 후 재등장하도록 key 로 remount 한다
          ("이 버튼은 이 카드 것"이라는 종속성 유지). */}
      <AnimatedCta
        key={focusedPlaceId ?? 'none'}
        searchText={suggestion?.searchText ?? ''}
        isVisible={isVisible}
        onPress={() => suggestion && onPress(suggestion)}
      />
    </Slot>
  );
}

function AnimatedCta({
  searchText,
  isVisible,
  onPress,
}: {
  searchText: string;
  isVisible: boolean;
  onPress: () => void;
}) {
  const [isReduceMotionEnabled, setIsReduceMotionEnabled] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setIsReduceMotionEnabled);
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setIsReduceMotionEnabled,
    );
    return () => subscription.remove();
  }, []);

  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(isVisible ? 1 : 0, {
      duration: isVisible ? ENTER_DURATION_MS : EXIT_DURATION_MS,
      easing: isVisible ? ENTER_EASING : EXIT_EASING,
    });
  }, [isVisible, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    if (isReduceMotionEnabled) {
      return {opacity: progress.value};
    }
    return {
      opacity: progress.value,
      transform: [
        {translateY: 6 * (1 - progress.value)},
        {scale: 0.96 + 0.04 * progress.value},
      ],
    };
  });

  if (!searchText) return null;

  return (
    <Animated.View
      style={animatedStyle}
      // 등장 전/중에는 오터치로 잘못된 카테고리 검색이 실행되지 않게 한다.
      pointerEvents={isVisible ? 'auto' : 'none'}>
      <CtaButton
        elementName="search_alternative_search_button"
        logParams={{searchText}}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`주위 다른 ${searchText} 확인하기`}
        onPress={onPress}>
        <CtaText>{`주위 다른 ${searchText} 확인하기`}</CtaText>
        <ChevronRightIcon width={20} height={20} color={color.white} />
      </CtaButton>
    </Animated.View>
  );
}

const Slot = styled.View`
  height: ${SLOT_HEIGHT}px;
  align-self: stretch;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 10px;
`;

const CtaButton = styled(SccTouchableOpacity)`
  min-height: 44px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 10px 12px 10px 20px;
  border-radius: 100px;
  background-color: ${() => color.brand40};
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.2;
  shadow-radius: 4px;
  elevation: 3;
`;

const CtaText = styled.Text`
  font-size: 14px;
  line-height: 20px;
  font-family: ${() => font.pretendardSemibold};
  color: ${() => color.white};
`;
