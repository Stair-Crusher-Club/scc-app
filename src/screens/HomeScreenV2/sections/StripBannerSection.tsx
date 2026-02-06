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
import {HomeBannerDto} from '@/generated-sources/openapi';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import useNavigation from '@/navigation/useNavigation';
import {isAppDeepLink} from '@/utils/deepLinkUtils';
import {useCheckAuth} from '@/utils/checkAuth';

const AUTO_SCROLL_INTERVAL_MS = 5000;
const INITIAL_DELAY_MS = 1500;
const SCROLL_ANIMATION_DURATION_MS = 800;
const SCREEN_WIDTH = Dimensions.get('window').width;
const BANNER_HORIZONTAL_PADDING = 20;
const BANNER_WIDTH = SCREEN_WIDTH - BANNER_HORIZONTAL_PADDING * 2;
const BANNER_HEIGHT = 67;
const BANNER_GAP = 12;
const ITEM_SLOT_WIDTH = BANNER_WIDTH + BANNER_GAP;

const WINDOW_HALF = 10;

interface StripBannerSectionProps {
  banners: HomeBannerDto[];
}

export default function StripBannerSection({banners}: StripBannerSectionProps) {
  const len = banners.length;

  const scrollPosition = useRef(new Animated.Value(0)).current;
  const scrollPosRef = useRef(0);

  const renderCenterRef = useRef(0);
  const [renderCenter, setRenderCenter] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(0);

  const autoScrollTimer = useRef<NodeJS.Timeout | null>(null);
  const panStartRef = useRef(0);

  useEffect(() => {
    const id = scrollPosition.addListener(({value}) => {
      scrollPosRef.current = value;
    });
    return () => scrollPosition.removeListener(id);
  }, [scrollPosition]);

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
    if (len <= 1) {
      return;
    }
    // Start with initial delay to avoid simultaneous rolling with main banner
    const initialTimer = setTimeout(() => {
      startAutoScroll();
    }, INITIAL_DELAY_MS);

    return () => {
      clearTimeout(initialTimer);
      stopAutoScroll();
    };
  }, [len, startAutoScroll, stopAutoScroll]);

  // ── Manual swipe via PanResponder ────────────────────────────
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponderCapture: (_, {dx, dy}) =>
          Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10,
        onPanResponderGrant: () => {
          stopAutoScroll();
          panStartRef.current = scrollPosRef.current;
        },
        onPanResponderMove: (_, {dx}) => {
          const newPos = panStartRef.current + dx;
          scrollPosition.setValue(newPos);
          const newCenter = Math.round(-newPos / ITEM_SLOT_WIDTH);
          if (
            Math.abs(newCenter - renderCenterRef.current) >
            Math.floor(WINDOW_HALF / 2)
          ) {
            updateCenter(newCenter);
          }
        },
        onPanResponderRelease: (_, {dx, vx}) => {
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
            scrollPosition.setValue(targetPos);
            scrollPosRef.current = targetPos;
            updateCenter(targetSlot);
            startAutoScroll();
          });
        },
      }),
    [scrollPosition, stopAutoScroll, startAutoScroll, updateCenter],
  );

  // ── Render ───────────────────────────────────────────────────
  if (len === 0) {
    return null;
  }

  if (len === 1) {
    return (
      <LogParamsProvider params={{displaySectionName: 'strip_banner_section'}}>
        <Container>
          <SingleBannerWrapper>
            <StripBanner banner={banners[0]} index={0} />
          </SingleBannerWrapper>
        </Container>
      </LogParamsProvider>
    );
  }

  return (
    <LogParamsProvider params={{displaySectionName: 'strip_banner_section'}}>
      <Container>
        <BannerTrack {...panResponder.panHandlers}>
          <Animated.View style={{transform: [{translateX: scrollPosition}]}}>
            {items.map(item => (
              <BannerSlot
                key={item.slot}
                style={{
                  left: item.slot * ITEM_SLOT_WIDTH + BANNER_HORIZONTAL_PADDING,
                }}>
                <StripBanner banner={item.banner} index={item.ringIndex} />
              </BannerSlot>
            ))}
          </Animated.View>
        </BannerTrack>
        <DotsContainer>
          {banners.map((_, index) => (
            <Dot key={index} active={index === displayIndex} />
          ))}
        </DotsContainer>
      </Container>
    </LogParamsProvider>
  );
}

// ── Banner item ──────────────────────────────────────────────────

interface StripBannerProps {
  banner: HomeBannerDto;
  index: number;
}

function StripBanner({banner, index}: StripBannerProps) {
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
      elementName="home_v2_strip_banner"
      logParams={{banner_key: banner.loggingKey, index}}
      onPress={() => checkAuth(openBanner)}>
      <BannerContainer>
        <SccRemoteImage
          imageUrl={banner.imageUrl}
          style={{
            width: BANNER_WIDTH,
            height: BANNER_HEIGHT,
            borderRadius: 6,
          }}
        />
      </BannerContainer>
    </SccPressable>
  );
}

// ── Styles ───────────────────────────────────────────────────────

const Container = styled.View`
  padding-bottom: 16px;
`;

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
  border-radius: 6px;
  overflow: hidden;
`;

const DotsContainer = styled.View`
  flex-direction: row;
  gap: 6px;
  align-items: center;
  justify-content: center;
  margin-top: 12px;
`;

const Dot = styled.View<{active: boolean}>`
  width: 6px;
  height: 6px;
  border-radius: 100px;
  background-color: ${({active}) => (active ? color.gray50 : color.gray20)};
`;
