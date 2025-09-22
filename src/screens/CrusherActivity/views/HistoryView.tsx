import {color} from '@/constant/color';
import {font} from '@/constant/font';
import React from 'react';
import {Image, Text, View} from 'react-native';

export default function HistoryView() {
  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 168,
        gap: 12,
      }}>
      <Image
        source={require('@/assets/img/img_crusher_history_history_empty.png')}
        style={{
          width: 128,
          height: 60,
        }}
      />
      <Text
        style={{
          textAlign: 'center',
          lineHeight: 24,
          fontSize: 16,
          fontFamily: font.pretendardRegular,
          color: color.gray50,
        }}>
        준비중입니다.
      </Text>
    </View>
  );
}
