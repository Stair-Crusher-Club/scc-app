import React from 'react';
import {Image, ScrollView, View} from 'react-native';

import MenuListSection from './components/MenuListSection';
import MyProfileSection from './components/MyProfileSection';

export interface MenuScreenParams {}

const MenuScreen = ({}: any) => {
  return (
    <ScrollView className="bg-white">
      <Image
        source={require('@/assets/img/bg_mypage_header.jpg')}
        className="w-full h-[220px]"
      />
      <MyProfileSection />
      <View className="h-[10px] w-full bg-gray-10" />
      <MenuListSection />
    </ScrollView>
  );
};

export default MenuScreen;
