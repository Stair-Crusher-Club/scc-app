import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Linking,
  PanResponder,
} from 'react-native';
import styled from 'styled-components/native';

import {SccPressable} from '@/components/SccPressable';
import SccRemoteImage from '@/components/SccRemoteImage';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {HomeBannerDto} from '@/generated-sources/openapi';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import useNavigation from '@/navigation/useNavigation';
import {isAppDeepLink} from '@/utils/deepLinkUtils';
import {useCheckAuth} from '@/utils/checkAuth';

const AUTO_SCROLL_INTERVAL_MS = 5000;
const SCROLL_ANIMATION_DURATION_MS = 800;
const SCREEN_WIDTH = Dimensions.get('window').width;
const BANNER_HORIZONTAL_PADDING = 20;
const BANNER_WIDTH = SCREEN_WIDTH - BANNER_HORIZONTAL_PADDING * 2;
const BANNER_HEIGHT = 290;
const BANNER_GAP = 12;
const ITEM_SLOT_WIDTH = BANNER_WIDTH + BANNER_GAP;

// Only render current ± WINDOW_HALF items (total 21).
// Items are placed at absolute coordinates; when the window shifts,
// only off-screen edges change — visible items stay put, so no flicker.
const WINDOW_HALF = 10;

interface MainBannerSectionProps {
  banners: HomeBannerDto[];
  onPanStateChange?: (isPanning: boolean) => void;
}

export default function MainBannerSection({
  banners,
  onPanStateChange,
}: MainBannerSectionProps) {
  const len = banners.length;

  // scrollPosition: accumulated translateX. Never reset.
  // slot N is visually centered when scrollPosition = -N * ITEM_SLOT_WIDTH.
  const scrollPosition = useRef(new Animated.Value(0)).current;
  const scrollPosRef = useRef(0);

  const renderCenterRef = useRef(0);
  const [renderCenter, setRenderCenter] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(0);

  const autoScrollTimer = useRef<NodeJS.Timeout | null>(null);
  const panStartRef = useRef(0);
  const onPanStateChangeRef = useRef(onPanStateChange);
  onPanStateChangeRef.current = onPanStateChange;

  // Mirror animated value to JS ref
  useEffect(() => {
    const id = scrollPosition.addListener(({value}) => {
      scrollPosRef.current = value;
    });
    return () => scrollPosition.removeListener(id);
  }, [scrollPosition]);

  // Render only items within [renderCenter - WINDOW_HALF, renderCenter + WINDOW_HALF].
  // Each item is keyed and positioned by its absolute "slot" number.
  const items = useMemo(() => {
    if (len <= 1) {
      return banners.map((b, i) => ({banner: b, ringIndex: i, slot: i}));
    }
    return Array.from({length: WINDOW_HALF * 2 + 1}, (_, i) => {
      const slot = renderCenter - WINDOW_HALF + i;
      const ringIdx = ((slot % len) + len) % len;
      return {banner: banners[ringIdx], ringIndex: ringIdx, slot};
    });
  }, [banners, renderCenter, len]);

  const updateCenter = useCallback(
    (newCenter: number) => {
      renderCenterRef.current = newCenter;
      setRenderCenter(newCenter);
      setDisplayIndex(((newCenter % len) + len) % len);
    },
    [len],
  );

  // ── Auto scroll ──────────────────────────────────────────────
  const startAutoScroll = useCallback(() => {
    if (len <= 1) {
      return;
    }
    autoScrollTimer.current = setInterval(() => {
      const currentSlot = Math.round(-scrollPosRef.current / ITEM_SLOT_WIDTH);
      const targetPos = -(currentSlot + 1) * ITEM_SLOT_WIDTH;

      Animated.timing(scrollPosition, {
        toValue: targetPos,
        duration: SCROLL_ANIMATION_DURATION_MS,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }).start(({finished}) => {
        if (!finished) {
          return;
        }
        updateCenter(currentSlot + 1);
      });
    }, AUTO_SCROLL_INTERVAL_MS);
  }, [len, scrollPosition, updateCenter]);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
      autoScrollTimer.current = null;
    }
    scrollPosition.stopAnimation();
  }, [scrollPosition]);

  useEffect(() => {
    startAutoScroll();
    return () => stopAutoScroll();
  }, [startAutoScroll, stopAutoScroll]);

  // ── Manual swipe via PanResponder ────────────────────────────
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        // Capture horizontal gestures before children (SccPressable) claim them
        onMoveShouldSetPanResponderCapture: (_, {dx, dy}) =>
          Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10,
        onPanResponderGrant: () => {
          onPanStateChangeRef.current?.(true);
          stopAutoScroll();
          panStartRef.current = scrollPosRef.current;
        },
        onPanResponderMove: (_, {dx}) => {
          const newPos = panStartRef.current + dx;
          scrollPosition.setValue(newPos);
          // Shift render window if dragged far from center
          const newCenter = Math.round(-newPos / ITEM_SLOT_WIDTH);
          if (
            Math.abs(newCenter - renderCenterRef.current) >
            Math.floor(WINDOW_HALF / 2)
          ) {
            updateCenter(newCenter);
          }
        },
        onPanResponderRelease: (_, {dx, vx}) => {
          onPanStateChangeRef.current?.(false);
          const startSlot = Math.round(-panStartRef.current / ITEM_SLOT_WIDTH);
          let targetSlot = startSlot;

          if (Math.abs(dx) > BANNER_WIDTH / 4 || Math.abs(vx) > 0.5) {
            targetSlot = dx > 0 ? startSlot - 1 : startSlot + 1;
          }

          const targetPos = -targetSlot * ITEM_SLOT_WIDTH;

          Animated.spring(scrollPosition, {
            toValue: targetPos,
            useNativeDriver: true,
            overshootClamping: true,
            restSpeedThreshold: 0.1,
            restDisplacementThreshold: 0.1,
          }).start(({finished}) => {
            if (!finished) {
              return;
            }
            // Snap to exact position
            scrollPosition.setValue(targetPos);
            scrollPosRef.current = targetPos;
            updateCenter(targetSlot);
            startAutoScroll();
          });
        },
        onPanResponderTerminate: () => {
          onPanStateChangeRef.current?.(false);
          // Snap back to nearest slot
          const currentSlot = Math.round(
            -scrollPosRef.current / ITEM_SLOT_WIDTH,
          );
          const targetPos = -currentSlot * ITEM_SLOT_WIDTH;
          scrollPosition.setValue(targetPos);
          scrollPosRef.current = targetPos;
          updateCenter(currentSlot);
          startAutoScroll();
        },
        onPanResponderTerminationRequest: () => false,
      }),
    [scrollPosition, stopAutoScroll, startAutoScroll, updateCenter],
  );

  // ── Render ───────────────────────────────────────────────────
  if (len === 0) {
    return null;
  }

  if (len === 1) {
    return (
      <LogParamsProvider params={{displaySectionName: 'main_banner_section'}}>
        <Container>
          <SingleBannerWrapper>
            <MainBanner banner={banners[0]} index={0} />
          </SingleBannerWrapper>
        </Container>
      </LogParamsProvider>
    );
  }

  return (
    <LogParamsProvider params={{displaySectionName: 'main_banner_section'}}>
      <Container>
        <BannerTrack {...panResponder.panHandlers}>
          <Animated.View style={{transform: [{translateX: scrollPosition}]}}>
            {items.map(item => (
              <BannerSlot
                key={item.slot}
                style={{
                  left: item.slot * ITEM_SLOT_WIDTH + BANNER_HORIZONTAL_PADDING,
                }}>
                <MainBanner banner={item.banner} index={item.ringIndex} />
              </BannerSlot>
            ))}
          </Animated.View>
        </BannerTrack>
        <PageIndicator>
          <PageIndicatorText>
            {displayIndex + 1} / {len}
          </PageIndicatorText>
        </PageIndicator>
      </Container>
    </LogParamsProvider>
  );
}

// ── Banner item ──────────────────────────────────────────────────

interface MainBannerProps {
  banner: HomeBannerDto;
  index: number;
}

function MainBanner({banner, index}: MainBannerProps) {
  const navigation = useNavigation();
  const checkAuth = useCheckAuth();

  const openBanner = async () => {
    const url = banner.clickPageUrl;

    if (isAppDeepLink(url)) {
      await Linking.openURL(url);
    } else {
      navigation.navigate('Webview', {
        fixedTitle: banner.clickPageTitle,
        url: url,
      });
    }
  };

  return (
    <SccPressable
      elementName="home_v2_main_banner"
      logParams={{banner_key: banner.loggingKey, index}}
      onPress={() => checkAuth(openBanner)}>
      <BannerContainer>
        <SccRemoteImage
          imageUrl={banner.imageUrl}
          style={{
            width: BANNER_WIDTH,
            height: BANNER_HEIGHT,
            borderRadius: 12,
          }}
        />
      </BannerContainer>
    </SccPressable>
  );
}

// ── Styles ───────────────────────────────────────────────────────

const Container = styled.View``;

const SingleBannerWrapper = styled.View`
  padding-horizontal: ${BANNER_HORIZONTAL_PADDING}px;
`;

const BannerTrack = styled.View`
  height: ${BANNER_HEIGHT}px;
  overflow: hidden;
`;

const BannerSlot = styled.View`
  position: absolute;
  width: ${BANNER_WIDTH}px;
  height: ${BANNER_HEIGHT}px;
  top: 0;
`;

const BannerContainer = styled.View`
  border-radius: 12px;
  overflow: hidden;
`;

const PageIndicator = styled.View`
  position: absolute;
  top: 20px;
  right: 32px;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 9px;
  padding-horizontal: 8px;
  padding-vertical: 1px;
`;

const PageIndicatorText = styled.Text`
  color: ${color.white};
  font-size: 12px;
  font-family: ${font.pretendardMedium};
`;
