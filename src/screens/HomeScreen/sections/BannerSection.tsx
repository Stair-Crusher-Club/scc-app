import {useQuery} from '@tanstack/react-query';
import React, {useEffect, useState} from 'react';
import {Image} from 'react-native';
import styled from 'styled-components/native';

import {SccPressable} from '@/components/SccPressable';
import {HomeBannerDto} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import useNavigation from '@/navigation/useNavigation';
import CoachMarkBanner from '@/screens/HomeScreen/components/CoachMarkBanner';
import CoachMarkTarget from '@/screens/HomeScreen/components/CoachMarkTarget';
import {useCheckAuth} from '@/utils/checkAuth';
import SccRemoteImage from '@/components/SccRemoteImage';

const BannerSection = () => {
  const {api} = useAppComponents();

  const {data} = useQuery({
    queryKey: ['BannerSection', 'HomeBanners'],
    queryFn: async () => (await api.getHomeBanners()).data,
  });

  const banners = data?.banners;

  return (
    <Container>
      {banners &&
        banners.map((banner, index) =>
          index === 0 ? (
            <CoachMarkTarget
              id="banner"
              key={banner.id}
              renderItem={CoachMarkBanner}>
              <Banner banner={banner} />
            </CoachMarkTarget>
          ) : (
            <Banner key={banner.id} banner={banner} />
          ),
        )}
    </Container>
  );
};

const Banner = ({banner}: {banner: HomeBannerDto}) => {
  const navigation = useNavigation();
  const checkAuth = useCheckAuth();
  const [aspectRatio, setAspectRatio] = useState(0);

  useEffect(() => {
    Image.getSize(banner.imageUrl, (width, height) => {
      if (width && height) {
        setAspectRatio(width / height);
      }
    });
  }, [banner, aspectRatio]);

  const openBanner = async () => {
    navigation.navigate('Webview', {
      fixedTitle: banner.clickPageTitle,
      url: banner.clickPageUrl,
    });
  };

  return (
    <SccPressable
      elementName="home_banner"
      logParams={{banner_key: banner.loggingKey}}
      onPress={() => checkAuth(openBanner)}>
      {/* <BannerImage source={{uri: banner.imageUrl}} aspectRatio={aspectRatio} /> */}
      <SccRemoteImage imageUrl={banner.imageUrl} style={{borderRadius: 6}} />
    </SccPressable>
  );
};

export default BannerSection;

const Container = styled.View({
  flex: 1,
  gap: 12,
  flexDirection: 'column',
  paddingTop: 20,
  paddingBottom: 30,
  paddingHorizontal: 20,
});

const BannerImage = styled.Image<{aspectRatio: number}>(({aspectRatio}) => ({
  width: '100%',
  height: 'auto',
  aspectRatio: `${aspectRatio} / 1`,
  borderRadius: 6,
}));
