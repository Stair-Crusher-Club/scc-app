import React from 'react';
import {Text, View} from 'react-native';

import {useMe} from '@/atoms/Auth';
import {SccPressable} from '@/components/SccPressable';
import useNavigation from '@/navigation/useNavigation';

export default function MyProfileSection() {
  const navigation = useNavigation();
  const {userInfo} = useMe();

  function openProfileEditorScreen() {
    navigation.navigate('ProfileEditor');
  }
  return (
    <View className="flex-row items-center justify-between px-6 py-6 pr-5">
      <View>
        <Text className="mb-1 font-pretendard-bold text-[20px] leading-[28px] text-black">
          {userInfo?.nickname}
        </Text>
        <Text className="font-pretendard-regular text-[14px] leading-[20px] text-gray-80">
          {userInfo?.email}
        </Text>
      </View>
      <View>
        <SccPressable
          className="rounded-[20px] bg-gray-10 px-3 py-2"
          elementName="edit_profile_button"
          onPress={openProfileEditorScreen}>
          <Text className="font-pretendard-semibold text-[14px] leading-[22px] text-black">
            프로필 수정
          </Text>
        </SccPressable>
      </View>
    </View>
  );
}
