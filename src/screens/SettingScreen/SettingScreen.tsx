import React from 'react';
import {View} from 'react-native';

import {ScreenLayout} from '@/components/ScreenLayout';
import {isFeatureEnabled} from '@/features/sandboxFeatures';
import {ScreenProps} from '@/navigation/Navigation.screens';

import BottomButtons from './components/BottomButtons';
import IdRow from './components/IdRow';
import MarketingPushAgreementRow from './components/MarketingPushAgreementRow';
import VersionRow from './components/VersionRow';

const SettingScreen = ({}: ScreenProps<'Setting'>) => {
  return (
    <ScreenLayout isHeaderVisible safeAreaEdges={['bottom']}>
      <View className="h-[26px]" />
      <VersionRow />
      <IdRow />
      {isFeatureEnabled('MARKETING_PUSH_AGREEMENT') && (
        <MarketingPushAgreementRow />
      )}
      <View className="flex-1" />
      <BottomButtons />
    </ScreenLayout>
  );
};

export default SettingScreen;
