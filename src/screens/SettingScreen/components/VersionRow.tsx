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
    <View className="flex-row justify-between items-center py-5 px-[25px]">
      <View>
        <Text className="text-black text-[16px] font-pretendard-regular">
          현재 버전
        </Text>
        <Text className="text-gray-70 text-[14px] font-pretendard-regular mt-0.5">
          {`${DeviceInfo.getVersion()}(${DeviceInfo.getBuildNumber()}${flavor})`}
        </Text>
        <Text className="text-gray-70 text-[10px] font-pretendard-regular mt-0.5">
          {HotUpdater.getBundleId()}
        </Text>
      </View>
      <View>
        <SccTouchableHighlight
          elementName="setting_version_store_button"
          activeOpacity={0.9}
          underlayColor={color.brandColor}
          onPress={goToStore}
          className="rounded-[10px] bg-brand-10 px-[10px] py-2">
          <Text className="text-link text-[14px] leading-[22px] font-pretendard-regular">
            스토어로 이동
          </Text>
        </SccTouchableHighlight>
      </View>
    </View>
  );
}
