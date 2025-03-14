import React from 'react';
import {View} from 'react-native';

import {ScreenLayout} from '@/components/ScreenLayout';
import {ScreenProps} from '@/navigation/Navigation.screens';

import BottomButtons from './components/BottomButtons';
import VersionRow from './components/VersionRow';

const SettingScreen = ({}: ScreenProps<'Setting'>) => {
  return (
    <ScreenLayout isHeaderVisible>
      <View style={{height: 26}} />
      <VersionRow />
      <View style={{flex: 1}} />
      <BottomButtons />
    </ScreenLayout>
  );
};

export default SettingScreen;
