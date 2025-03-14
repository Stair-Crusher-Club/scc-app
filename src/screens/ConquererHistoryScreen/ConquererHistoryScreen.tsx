import React from 'react';
import {ScrollView} from 'react-native';

import {ScreenLayout} from '@/components/ScreenLayout';

import AchivementsSection from './sections/AchivementsSection';
import ConquerByMonthSection from './sections/ConquerByMonthSection';

export default function ConquererHistoryScreen() {
  return (
    <ScreenLayout isHeaderVisible={true}>
      <ScrollView
        contentContainerStyle={{flexGrow: 1}}
        style={{backgroundColor: 'white'}}>
        <AchivementsSection />
        <ConquerByMonthSection />
      </ScrollView>
    </ScreenLayout>
  );
}
