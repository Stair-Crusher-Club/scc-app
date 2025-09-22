import React from 'react';
import {LayoutRectangle, Text, View} from 'react-native';

import CoachBannerArrow from '@/assets/icon/coach_banner_arrow.svg';
import {color} from '@/constant/color';

import * as S from './CoachMark.style';

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
          <S.Description>계단뿌셔클럽의</S.Description>
          <S.Description>
            <Text style={{color: color.yellow}}>주요소식</Text>을 확인할 수
            있어요.
          </S.Description>
        </View>
      </View>
    </>
  );
}
