import React from 'react';
import {LayoutRectangle, Text, View} from 'react-native';

import CoachBannerArrow from '@/assets/icon/coach_banner_arrow.svg';
import {color} from '@/constant/color';

export default function CoachMarkBanner({y}: Omit<LayoutRectangle, 'height'>) {
  return (
    <>
      <CoachBannerArrow
        style={{
          position: 'absolute',
          top: y - 48,
          right: 204,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: y - 64,
          right: 24,
        }}>
        <View>
          <Text className="text-[15px] text-white font-pretendard-semibold">
            계단뿌셔클럽의
          </Text>
          <Text className="text-[15px] text-white font-pretendard-semibold">
            <Text style={{color: color.yellow}}>주요소식</Text>을 확인할 수
            있어요.
          </Text>
        </View>
      </View>
    </>
  );
}
