import React, {useEffect, useRef, useState} from 'react';
import {AccessibilityInfo} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
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
import {useLogger} from '@/logging/useLogger';
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
  hasAccessiblePlaceInResults,
  onPress,
}: {
  focusedPlaceId: string | null;
  isScrolling: boolean;
  currentSearchText: string | null;
  /** 결과 목록에 접근레벨 2 이하가 있는지. 판정은 서버가 하고, 이 값은 그 입력이다. */
  hasAccessiblePlaceInResults: boolean;
  onPress: (suggestion: AlternativeSearchSuggestionDto) => void;
}) {
  const suggestion = useAlternativeSearchSuggestion({
    focusedPlaceId,
    currentSearchText,
    hasAccessiblePlaceInResults,
  });

  // 스크롤이 시작되면 결과와 무관하게 즉시 숨긴다.
  const isVisible = !!suggestion && !isScrolling;

  return (
    <Slot pointerEvents="box-none">
      {/* key 로 remount 하면 퇴장 애니메이션이 재생되기 전에 노드가 사라져 뚝 끊긴다.
          카드 종속감(라벨이 이 카드 것)은 AnimatedCta 안에서 "퇴장이 끝난 뒤에만 라벨을
          교체"하는 방식으로 지킨다. */}
      <AnimatedCta
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

  // 퇴장 중에 라벨이 빈 문자열로 바뀌거나 노드가 사라지면 "버벅이며 사라지는" 느낌이 난다.
  // 보이는 동안의 라벨을 붙잡아 두고, 퇴장이 **끝난 뒤에** 다음 라벨로 교체한다.
  const [renderedText, setRenderedText] = useState(searchText);
  useEffect(() => {
    if (isVisible && searchText) setRenderedText(searchText);
  }, [isVisible, searchText]);

  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(
      isVisible ? 1 : 0,
      {
        duration: isVisible ? ENTER_DURATION_MS : EXIT_DURATION_MS,
        easing: isVisible ? ENTER_EASING : EXIT_EASING,
      },
      finished => {
        // 퇴장이 온전히 끝난 뒤에만 라벨을 비운다(다음 카드 라벨로 갈아끼울 준비).
        if (finished && !isVisible) runOnJS(setRenderedText)('');
      },
    );
  }, [isVisible, progress]);

  // 노출 로깅은 **실제로 보이기 시작한 순간**에 남긴다.
  // SccXxx 의 trackView 는 마운트 시점에 발사되는데, 이 CTA 는 제안이 도착하면 마운트된 뒤
  // opacity 0 -> 1 로 등장한다. 스크롤 중에 제안이 도착하면 화면에 보이지 않는 상태로
  // 마운트되므로, trackView 를 쓰면 사용자가 못 본 노출까지 집계된다.
  // key 로 remount 하지 않으므로(퇴장 애니메이션 보존) 카드별로 1회씩 남도록 placeId 를 기록한다.
  const logger = useLogger();
  const loggerRef = useRef(logger);
  loggerRef.current = logger;
  const loggedPlaceIdRef = useRef<string | null>(null);
  useEffect(() => {
    // 렌더 가드(`if (!renderedText) return null`)와 조건을 맞춘다. renderedText 가 아직
    // 비어 노드가 렌더되지 않은 프레임에서 노출로 집계하면 안 된다.
    if (
      isVisible &&
      renderedText &&
      placeId &&
      loggedPlaceIdRef.current !== placeId
    ) {
      loggedPlaceIdRef.current = placeId;
      loggerRef.current.logElementView('search_alternative_search_button', {
        alternative_search_text: renderedText,
        place_id: placeId,
      });
    }
  }, [isVisible, renderedText, placeId]);

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

  if (!renderedText) return null;

  return (
    <Animated.View
      style={animatedStyle}
      // 등장 전/중에는 오터치로 잘못된 카테고리 검색이 실행되지 않게 한다.
      pointerEvents={isVisible ? 'auto' : 'none'}>
      <CtaButton
        elementName="search_alternative_search_button"
        logParams={{alternative_search_text: renderedText, place_id: placeId}}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`주위 다른 ${renderedText} 확인하기`}
        onPress={onPress}>
        <CtaText>{`주위 다른 ${renderedText} 확인하기`}</CtaText>
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
