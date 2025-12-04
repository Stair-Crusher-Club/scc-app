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
    <View className="flex-row justify-between items-center py-6 pl-6 pr-5">
      <View>
        <Text className="font-pretendard-bold mb-[4px] text-[20px]">
          {userInfo?.nickname}
        </Text>
        <Text className="font-pretendard-regular text-gray-80 text-[14px]">
          {userInfo?.email}
        </Text>
      </View>
      <View>
        <SccPressable
          elementName="edit_profile_button"
          onPress={openProfileEditorScreen}>
          <View className="py-2 px-3 bg-gray-10 rounded-[20px]">
            <Text className="font-pretendard-semibold text-[14px] leading-[22px]">
              프로필 수정
            </Text>
          </View>
        </SccPressable>
      </View>
    </View>
  );
}
