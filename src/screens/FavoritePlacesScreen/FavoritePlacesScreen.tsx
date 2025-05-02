import React from 'react';
import {ScrollView, View} from 'react-native';

import {ScreenLayout} from '@/components/ScreenLayout';

import FavoriteListView from './components/FavoriteListView';

export default function FavoritePlacesScreen() {
  return (
    <ScreenLayout isHeaderVisible={true}>
      <View
        style={{
          borderBottomWidth: 1,
          borderBottomColor: '#EFF0F2',
        }}
      />
      <ScrollView
        contentContainerStyle={{flexGrow: 1}}
        style={{
          backgroundColor: 'white',
        }}>
        <FavoriteListView />
      </ScrollView>
    </ScreenLayout>
  );
}
