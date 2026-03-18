import {HotUpdater} from '@hot-updater/react-native';
import React from 'react';
import {Linking, Platform, Text, View} from 'react-native';
import Config from 'react-native-config';
import DeviceInfo from 'react-native-device-info';

import {SccTouchableHighlight} from '@/components/SccTouchableHighlight';
import {color} from '@/constant/color';

export default function VersionRow() {
  const flavor = Config.FLAVOR ? ` - ${Config.FLAVOR}` : '';

  function goToStore() {
    if (Platform.OS === 'android') {
      Linking.openURL(
        'https://play.google.com/store/apps/details?id=club.staircrusher',
      );
    }
    if (Platform.OS === 'ios') {
      Linking.openURL('https://itunes.apple.com/app/id/6444382843');
    }
  }

  return (
    <View className="px-5 py-5">
      <Text className="mb-[8px] font-pretendard-regular text-[14px] leading-[20px] text-gray-50">
        현재 버전
      </Text>
      <View className="flex-row items-center justify-between">
        <View className="gap-[2px]">
          <Text className="font-pretendard-medium text-[16px] leading-[26px] text-black">
            {`${DeviceInfo.getVersion()}(${DeviceInfo.getBuildNumber()}${flavor})`}
          </Text>
          <Text className="font-pretendard-regular text-[10px] leading-[14px] text-gray-45">
            {HotUpdater.getBundleId()}
          </Text>
        </View>
        <SccTouchableHighlight
          elementName="setting_version_store_button"
          activeOpacity={0.9}
          underlayColor={color.brandColor}
          className="rounded-[10px] bg-brand-10 px-[10px] py-[8px]"
          onPress={goToStore}>
          <Text className="font-pretendard-regular text-[14px] leading-[22px] text-link">
            스토어로 이동
          </Text>
        </SccTouchableHighlight>
      </View>
    </View>
  );
}
