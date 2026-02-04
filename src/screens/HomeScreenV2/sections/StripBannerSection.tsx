import React, {useRef, useState} from 'react';
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

const SCREEN_WIDTH = Dimensions.get('window').width;
const BANNER_HORIZONTAL_PADDING = 20;
const BANNER_WIDTH = SCREEN_WIDTH - BANNER_HORIZONTAL_PADDING * 2;
const BANNER_HEIGHT = 100;
const BANNER_GAP = 12;

const BannerSeparator = () => <View style={{width: BANNER_GAP}} />;

interface StripBannerSectionProps {
  banners: HomeBannerDto[];
}

export default function StripBannerSection({banners}: StripBannerSectionProps) {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

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
          <PageIndicator>
            <PageIndicatorText>
              {currentIndex + 1}/{banners.length}
            </PageIndicatorText>
          </PageIndicator>
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
            borderRadius: 8,
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
  border-radius: 8px;
  overflow: hidden;
`;

const PageIndicator = styled.View`
  position: absolute;
  bottom: 28px;
  right: 32px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 12px;
  padding-horizontal: 10px;
  padding-vertical: 4px;
`;

const PageIndicatorText = styled.Text`
  color: ${color.white};
  font-size: 12px;
  font-family: ${font.pretendardMedium};
`;
