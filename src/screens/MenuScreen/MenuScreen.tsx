import React from 'react';
import {Image, ScrollView} from 'react-native';

import Divider from './components/Divider';
import MenuListSection from './components/MenuListSection';
import MyProfileSection from './components/MyProfileSection';

export interface MenuScreenParams {}

const MenuScreen = ({}: any) => {
  return (
    <ScrollView className="bg-white">
      <Image
        source={require('../../assets/img/bg_mypage_header.jpg')}
        className="w-full h-[200px]"
      />
      <MyProfileSection />
      <Divider />
      <MenuListSection />
    </ScrollView>
  );
};

export default MenuScreen;
