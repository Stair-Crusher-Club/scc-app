import {useQuery} from '@tanstack/react-query';
import React, {useEffect, useState} from 'react';
import {Image, Pressable} from 'react-native';
import styled from 'styled-components/native';

import {HomeBannerDto} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import {LogClick} from '@/logging/LogClick';
import useNavigation from '@/navigation/useNavigation';
import CoachMarkBanner from '@/screens/HomeScreen/components/CoachMarkBanner';
import CoachMarkTarget from '@/screens/HomeScreen/components/CoachMarkTarget';
import {useCheckAuth} from '@/utils/checkAuth';

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
        banners.map((banner, index) => (
          <Banner isFirst={index === 0} key={banner.id} banner={banner} />
        ))}
    </Container>
  );
};

const Banner = ({
  banner,
  isFirst,
}: {
  banner: HomeBannerDto;
  isFirst: boolean;
}) => {
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

  if (isFirst) {
    return (
      <LogClick
        elementName="home_banner"
        params={{banner_key: banner.loggingKey}}>
        <CoachMarkTarget id="banner" renderItem={CoachMarkBanner}>
          <Pressable onPress={() => checkAuth(openBanner)}>
            <BannerImage
              source={{uri: banner.imageUrl}}
              aspectRatio={aspectRatio}
            />
          </Pressable>
        </CoachMarkTarget>
      </LogClick>
    );
  }

  return (
    <LogClick
      elementName="home_banner"
      params={{banner_key: banner.loggingKey}}>
      <Pressable onPress={() => checkAuth(openBanner)}>
        <BannerImage
          source={{uri: banner.imageUrl}}
          aspectRatio={aspectRatio}
        />
      </Pressable>
    </LogClick>
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
