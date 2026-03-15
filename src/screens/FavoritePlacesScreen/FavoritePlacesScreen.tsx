import React from 'react';
import {ScrollView, View} from 'react-native';

import {ScreenLayout} from '@/components/ScreenLayout';

import FavoriteListView from './components/FavoriteListView';

export default function FavoritePlacesScreen() {
  return (
    <ScreenLayout isHeaderVisible={true}>
      <View className="border-b-[1px] border-blue-5" />
      <ScrollView
        className="bg-white"
        contentContainerClassName="grow">
        <FavoriteListView />
      </ScrollView>
    </ScreenLayout>
  );
}
