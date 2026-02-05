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
import {font} from '@/constant/font';
import {HomeBannerDto} from '@/generated-sources/openapi';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import useNavigation from '@/navigation/useNavigation';
import {isAppDeepLink} from '@/utils/deepLinkUtils';
import {useCheckAuth} from '@/utils/checkAuth';

const AUTO_SCROLL_INTERVAL_MS = 4000;
const SCREEN_WIDTH = Dimensions.get('window').width;
const BANNER_HORIZONTAL_PADDING = 20;
const BANNER_WIDTH = SCREEN_WIDTH - BANNER_HORIZONTAL_PADDING * 2;
const BANNER_HEIGHT = 290;
const BANNER_GAP = 12;

const BannerSeparator = () => <View style={{width: BANNER_GAP}} />;

interface MainBannerSectionProps {
  banners: HomeBannerDto[];
}

export default function MainBannerSection({banners}: MainBannerSectionProps) {
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
    startAutoScroll();
    return () => stopAutoScroll();
  }, [startAutoScroll, stopAutoScroll]);

  const handleScrollBeginDrag = () => {
    stopAutoScroll();
  };

  const handleScrollEndDrag = () => {
    startAutoScroll();
  };

  const handleMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (BANNER_WIDTH + BANNER_GAP));
    setCurrentIndex(index);
  };

  if (banners.length === 0) {
    return null;
  }

  return (
    <LogParamsProvider params={{displaySectionName: 'main_banner_section'}}>
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
          onScrollBeginDrag={handleScrollBeginDrag}
          onScrollEndDrag={handleScrollEndDrag}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          renderItem={({item, index}) => (
            <MainBanner banner={item} index={index} />
          )}
          keyExtractor={item => item.id}
        />
        {banners.length > 1 && (
          <PageIndicator>
            <PageIndicatorText>
              {currentIndex + 1} / {banners.length}
            </PageIndicatorText>
          </PageIndicator>
        )}
      </Container>
    </LogParamsProvider>
  );
}

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

const Container = styled.View`
  padding-top: 8px;
  padding-bottom: 16px;
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
