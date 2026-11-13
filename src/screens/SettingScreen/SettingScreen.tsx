import React from 'react';
import {View} from 'react-native';

import {ScreenLayout} from '@/components/ScreenLayout';
import {isFeatureEnabled} from '@/features/sandboxFeatures';
import {ScreenProps} from '@/navigation/Navigation.screens';

import BottomButtons from './components/BottomButtons';
import IdRow from './components/IdRow';
import MarketingPushAgreementRow from './components/MarketingPushAgreementRow';
import PolicyLinkRow, {
  PRIVACY_POLICY_URL,
  TERMS_OF_SERVICE_URL,
} from './components/PolicyLinkRow';
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
      <PolicyLinkRow
        title="개인정보처리방침"
        url={PRIVACY_POLICY_URL}
        elementName="setting_privacy_policy_link"
      />
      <PolicyLinkRow
        title="서비스 이용약관"
        url={TERMS_OF_SERVICE_URL}
        elementName="setting_terms_of_service_link"
      />
      <View className="flex-1" />
      <BottomButtons />
    </ScreenLayout>
  );
};

export default SettingScreen;
