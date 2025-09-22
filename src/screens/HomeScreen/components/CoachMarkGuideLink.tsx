import React from 'react';
import {LayoutRectangle, Text, View} from 'react-native';

import CoachGuideArrow from '@/assets/icon/coach_guide_arrow.svg';
import {color} from '@/constant/color';

import * as S from './CoachMark.style';

export default function CoachMarkGuideLink({
  x,
  y,
  width,
}: Omit<LayoutRectangle, 'height'>) {
  return (
    <>
      <CoachGuideArrow
        style={{
          position: 'absolute',
          top: y - 20,
          left: x + width + 10,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: y - 20,
          left: x + width + 50,
        }}>
        <S.Description>
          <Text style={{color: color.yellow}}>사용설명서</Text>
          {'를 확인해서\n계단뿌셔클럽을 알아보세요.'}
        </S.Description>
      </View>
    </>
  );
}
