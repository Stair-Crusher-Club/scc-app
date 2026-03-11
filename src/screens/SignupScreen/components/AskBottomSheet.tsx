import React from 'react';
import {Text, View} from 'react-native';

import {SccButton} from '@/components/atoms';
import BottomSheet from '@/modals/BottomSheet';

interface AskBottomSheetProps {
  isVisible: boolean;
  onClose: (isAgree: boolean) => void;
  onDismiss?: () => void;
}

export default function AskBottomSheet({
  isVisible,
  onClose,
  onDismiss,
}: AskBottomSheetProps) {
  return (
    <BottomSheet isVisible={isVisible} onPressBackground={onDismiss}>
      <View className="p-[20px] gap-[24px]">
        <Text className="font-pretendard-bold text-[20px] text-gray-100">
          그렇다면,{'\n'}
          이동약자의 친구/가족/동료 이신가요?
        </Text>
        <View className="flex-row justify-between gap-[12px]">
          <SccButton
            text="네"
            buttonColor="white"
            borderColor="gray30"
            textColor="gray100"
            onPress={() => onClose(true)}
            style={{flexGrow: 1}}
            elementName="signup_ask_yes"
          />
          <SccButton
            text="아니오"
            buttonColor="white"
            borderColor="gray30"
            textColor="gray100"
            onPress={() => onClose(false)}
            style={{flexGrow: 1}}
            elementName="signup_ask_no"
          />
        </View>
      </View>
    </BottomSheet>
  );
}
