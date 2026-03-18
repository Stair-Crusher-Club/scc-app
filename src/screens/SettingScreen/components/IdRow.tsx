import Clipboard from '@react-native-clipboard/clipboard';
import React from 'react';
import {Text, View} from 'react-native';

import CopyIcon from '@/assets/icon/ic_copy.svg';
import {useMe} from '@/atoms/Auth';
import {SccTouchableHighlight} from '@/components/SccTouchableHighlight';
import {color} from '@/constant/color';
import ToastUtils from '@/utils/ToastUtils';

export default function IdRow() {
  const {userInfo} = useMe();

  const displayId = userInfo?.displayId ?? userInfo?.id;

  function copyIdToClipboard() {
    if (displayId) {
      Clipboard.setString(displayId);
      ToastUtils.show('ID가 복사되었습니다');
    }
  }

  return (
    <View className="px-5 py-5">
      <Text className="mb-[8px] font-pretendard-regular text-[14px] leading-[20px] text-gray-50">
        ID
      </Text>
      <View className="flex-row items-center justify-between">
        <Text className="font-pretendard-medium text-[16px] leading-[26px] text-black">
          {displayId}
        </Text>
        <SccTouchableHighlight
          elementName="setting_copy_id_button"
          activeOpacity={0.7}
          underlayColor={color.brand10}
          className="flex-row items-center gap-[2px] p-[4px]"
          onPress={copyIdToClipboard}>
          <View className="flex-row items-center gap-[2px]">
            <CopyIcon width={16} height={16} color={color.brandColor} />
            <Text className="font-pretendard-medium text-[13px] leading-[18px] text-brand-50">
              복사
            </Text>
          </View>
        </SccTouchableHighlight>
      </View>
    </View>
  );
}
