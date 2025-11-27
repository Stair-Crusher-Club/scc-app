import React from 'react';
import {LayoutRectangle, Text, View} from 'react-native';

import CoachMapIconArrow from '@/assets/icon/coach_map_icon_arrow.svg';
import {color} from '@/constant/color';

export default function CoachMarkMapButton({
  x,
  y,
  width,
}: Omit<LayoutRectangle, 'height'>) {
  return (
    <>
      <CoachMapIconArrow
        style={{
          position: 'absolute',
          top: y - 24,
          left: x + width + 6,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: y - 24,
          left: x + width + 44,
        }}>
        <View>
          <Text className="text-[15px] text-white font-pretendard-semibold">
            아이콘을 누르면
          </Text>
          <Text className="text-[15px] text-white font-pretendard-semibold">
            <Text style={{color: color.yellow}}>지도 화면</Text>
            으로 바로 이동할 수 있어요.
          </Text>
        </View>
      </View>
    </>
  );
}
