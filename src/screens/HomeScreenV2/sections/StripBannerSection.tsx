import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  FlatList,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
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

const AUTO_SCROLL_INTERVAL_MS = 4000;
const INITIAL_DELAY_MS = 1500;
const SCREEN_WIDTH = Dimensions.get('window').width;
const BANNER_HORIZONTAL_PADDING = 20;
const BANNER_WIDTH = SCREEN_WIDTH - BANNER_HORIZONTAL_PADDING * 2;
const BANNER_HEIGHT = 67;
const BANNER_GAP = 12;

const BannerSeparator = () => <View style={{width: BANNER_GAP}} />;

interface StripBannerSectionProps {
  banners: HomeBannerDto[];
}

export default function StripBannerSection({banners}: StripBannerSectionProps) {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoScrollTimer = useRef<NodeJS.Timeout | null>(null);

  const startAutoScroll = useCallback(() => {
    if (banners.length <= 1) {
      return;
    }
    autoScrollTimer.current = setInterval(() => {
      setCurrentIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % banners.length;
        flatListRef.current?.scrollToOffset({
          offset: nextIndex * (BANNER_WIDTH + BANNER_GAP),
          animated: true,
        });
        return nextIndex;
      });
    }, AUTO_SCROLL_INTERVAL_MS);
  }, [banners.length]);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
      autoScrollTimer.current = null;
    }
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      // Start with initial delay to avoid simultaneous rolling with main banner
      const initialTimer = setTimeout(() => {
        startAutoScroll();
      }, INITIAL_DELAY_MS);

      return () => {
        clearTimeout(initialTimer);
        stopAutoScroll();
      };
    }
  }, [banners.length, startAutoScroll, stopAutoScroll]);

  const handleMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (BANNER_WIDTH + BANNER_GAP));
    setCurrentIndex(index);
    // Restart auto scroll after manual interaction
    stopAutoScroll();
    startAutoScroll();
  };

  if (banners.length === 0) {
    return null;
  }

  return (
    <LogParamsProvider params={{displaySectionName: 'strip_banner_section'}}>
      <Container>
        <FlatList
          ref={flatListRef}
          data={banners}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToInterval={BANNER_WIDTH + BANNER_GAP}
          decelerationRate="fast"
          contentContainerStyle={{
            paddingHorizontal: BANNER_HORIZONTAL_PADDING,
          }}
          ItemSeparatorComponent={BannerSeparator}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          renderItem={({item, index}) => (
            <StripBanner banner={item} index={index} />
          )}
          keyExtractor={item => item.id}
        />
        {banners.length > 1 && (
          <DotsContainer>
            {banners.map((_, index) => (
              <Dot key={index} active={index === currentIndex} />
            ))}
          </DotsContainer>
        )}
      </Container>
    </LogParamsProvider>
  );
}

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

const Container = styled.View`
  padding-bottom: 16px;
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
