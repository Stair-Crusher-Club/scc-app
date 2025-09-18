import React from 'react';
import {Text, View} from 'react-native';

import {ScreenLayout} from '@/components/ScreenLayout';
import {ScreenProps} from '@/navigation/Navigation.screens';

export default function UpvoteAnalyticsScreen({
  route,
}: ScreenProps<'UpvoteAnalytics'>) {
  const {placeId} = route.params;

  return (
    <ScreenLayout isHeaderVisible={true}>
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Place ID: {placeId}</Text>
      </View>
    </ScreenLayout>
  );
}
