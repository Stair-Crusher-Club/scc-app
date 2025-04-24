import React from 'react';
import {ScrollView, View} from 'react-native';

import {ScreenLayout} from '@/components/ScreenLayout';
import {ScreenProps} from '@/navigation/Navigation.screens';

export default function FavoritePlacesScreen({}: ScreenProps<'Conquerer'>) {
  return (
    <ScreenLayout isHeaderVisible={true}>
      <ScrollView
        contentContainerStyle={{flexGrow: 1}}
        style={{backgroundColor: 'white'}}>
        <View style={{height: 60}} />
      </ScrollView>
    </ScreenLayout>
  );
}
