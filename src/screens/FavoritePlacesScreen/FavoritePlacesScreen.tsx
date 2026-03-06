import React from 'react';
import {ScrollView, View} from 'react-native';

import {ScreenLayout} from '@/components/ScreenLayout';
import {color} from '@/constant/color';

import FavoriteListView from './components/FavoriteListView';

export default function FavoritePlacesScreen() {
  return (
    <ScreenLayout isHeaderVisible={true}>
      <View
        style={{
          borderBottomWidth: 1,
          borderBottomColor: color.blue5,
        }}
      />
      <ScrollView
        contentContainerStyle={{flexGrow: 1}}
        style={{
          backgroundColor: color.white,
        }}>
        <FavoriteListView />
      </ScrollView>
    </ScreenLayout>
  );
}
