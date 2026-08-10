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

const ENTER_DURATION_MS = 220;
const EXIT_DURATION_MS = 140;
// 오버슈트·바운스 금지 — "툭 튀어나오는" 느낌이 나면 안 된다.
const ENTER_EASING = Easing.bezier(0.2, 0, 0, 1);
const EXIT_EASING = Easing.out(Easing.ease);

/**
 * 포커스된 카드 위에 뜨는 "주위 다른 OOO 확인하기" 버튼.
 *
 * **이 CTA를 띄우는 게 적절한 상황인지는 화면(SearchScreen)이 판단한다** — 이 컴포넌트가
 * 마운트됐다는 것은 이미 "대체 검색을 권할 상황"이라는 뜻이다. 여기서는 자기 로직으로만,
 * 즉 제안이 없거나 스크롤 중일 때만 스스로를 숨긴다.
 *
 * 슬롯은 제안 유무와 무관하게 렌더된다 (높이 고정 — 스와이프 중 카드가 흔들리지 않게).
 * 제안이 오기 전에는 버튼만 투명하게 빠진다 — 로딩 인디케이터는 두지 않는다.
 */
export default function AlternativeSearchCta({
  focusedPlaceId,
  isScrolling,
  currentSearchText,
  onPress,
}: {
  focusedPlaceId: string | null;
  isScrolling: boolean;
  currentSearchText: string | null;
  onPress: (suggestion: AlternativeSearchSuggestionDto) => void;
}) {
  const suggestion = useAlternativeSearchSuggestion({
    focusedPlaceId,
    currentSearchText,
  });

  // 스크롤이 시작되면 결과와 무관하게 즉시 숨긴다.
  const isVisible = !!suggestion && !isScrolling;

  return (
    <Slot pointerEvents="box-none">
      {/* 카드가 바뀌면 라벨이 같더라도 퇴장 후 재등장하도록 key 로 remount 한다
          ("이 버튼은 이 카드 것"이라는 종속성 유지). */}
      <AnimatedCta
        key={focusedPlaceId ?? 'none'}
        placeId={focusedPlaceId}
        searchText={suggestion?.searchText ?? ''}
        isVisible={isVisible}
        onPress={() => suggestion && onPress(suggestion)}
      />
    </Slot>
  );
}

function AnimatedCta({
  placeId,
  searchText,
  isVisible,
  onPress,
}: {
  placeId: string | null;
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
        // 노출(제안 true) 대비 클릭 전환을 볼 수 있게 노출도 함께 남긴다.
        // placeId는 서버의 제안 판단 로그(ALTERNATIVE_SEARCH_SUGGESTION)와 대조하기 위한 키다 —
        // "제안은 true였는데 스크롤로 스쳐 노출되지 않은" 케이스를 이 둘의 차이로 본다.
        trackView
        logParams={{alternative_search_text: searchText, place_id: placeId}}
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
