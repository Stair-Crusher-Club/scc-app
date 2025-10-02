import SccTouchableOpacity from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import React from 'react';
import {Text, View} from 'react-native';

export type Tab = 'current' | 'history';

export const tabs: {
  key: Tab;
  value: string;
}[] = [
  {
    key: 'current',
    value: '현재시즌',
  },
  {
    key: 'history',
    value: '히스토리',
  },
];

export default function MenuTabs({
  currentTab,
  setCurrentTab,
}: {
  currentTab: Tab;
  setCurrentTab: (tab: Tab) => void;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      {tabs.map(({key, value}) => (
        <SccTouchableOpacity
          elementName="crusher_activity_tab_menu"
          key={key}
          onPress={() => setCurrentTab(key)}
          style={{
            flex: 1,
            borderBottomWidth: currentTab === key ? 2 : 1,
            borderBottomColor:
              currentTab === key ? color.brand50 : color.gray20,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 12,
          }}>
          <Text
            style={{
              fontSize: 16,
              fontFamily: font.pretendardMedium,
              color: currentTab === key ? color.gray80 : color.gray40,
            }}>
            {value}
          </Text>
        </SccTouchableOpacity>
      ))}
    </View>
  );
}
