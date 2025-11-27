import {useQuery} from '@tanstack/react-query';
import React, {useEffect, useState} from 'react';
import {Image, View} from 'react-native';

import {SccPressable} from '@/components/SccPressable';
import SccRemoteImage from '@/components/SccRemoteImage';
import {HomeBannerDto} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
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
    <View className="flex-1 gap-3 flex-col pt-5 pb-[30px] px-5">
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
    </View>
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
