import React from 'react';
import {View} from 'react-native';
import styled from 'styled-components/native';

import {SccButton} from '@/components/atoms';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import BottomSheet from '@/modals/BottomSheet';

interface AskBottomSheetProps {
  isVisible: boolean;
  onClose: (isAgree: boolean) => void;
}

export default function AskBottomSheet({
  isVisible,
  onClose,
}: AskBottomSheetProps) {
  return (
    <BottomSheet isVisible={isVisible}>
      <View style={{padding: 20, gap: 24}}>
        <BottomSheetTitle>
          그렇다면,{'\n'}
          이동약자의 친구/가족/동료 이신가요?
        </BottomSheetTitle>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 12,
          }}>
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

const BottomSheetTitle = styled.Text`
  font-family: ${font.pretendardBold};
  font-size: 20px;
  color: ${color.gray100};
`;
