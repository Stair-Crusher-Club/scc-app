import React from 'react';
import {ScrollView, View} from 'react-native';

import {ScreenLayout} from '@/components/ScreenLayout';
import {ScreenProps} from '@/navigation/Navigation.screens';

import * as S from './ConquererScreen.style';
import ConquererSummarySection from './sections/ConquererSummarySection';
import CrusherHistorySection from './sections/CrusherHistorySection';
import WeeklyConquererSection from './sections/WeeklyConquererSection';

export default function ConquererScreen({}: ScreenProps<'Conquerer'>) {
  return (
    <ScreenLayout isHeaderVisible={true}>
      <ScrollView
        contentContainerStyle={{flexGrow: 1}}
        style={{backgroundColor: 'white'}}>
        <ConquererSummarySection />
        <WeeklyConquererSection />
        <S.Gap />
        <CrusherHistorySection />
        <View style={{height: 60}} />
      </ScrollView>
    </ScreenLayout>
  );
}
