import React from 'react';
import {Image, ScrollView} from 'react-native';

import Divider from './components/Divider';
import MenuListSection from './components/MenuListSection';
import MyProfileSection from './components/MyProfileSection';

export interface MenuScreenParams {}

const MenuScreen = ({}: any) => {
  return (
    <ScrollView style={{backgroundColor: 'white'}}>
      <Image
        source={require('../../assets/img/bg_mypage_header.jpg')}
        style={{width: '100%', height: 'auto', aspectRatio: '375/200'}}
      />
      <MyProfileSection />
      <Divider />
      <MenuListSection />
    </ScrollView>
  );
};

export default MenuScreen;
