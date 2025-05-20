import {useNavigation} from '@react-navigation/core';
import React from 'react';
import {Pressable} from 'react-native';

import LeftArrowIcon from '@/assets/icon/ic_arrow_left.svg';
import {color} from '@/constant/color';

import * as S from './PlaceDetailAppBar.style';

export default function PlaceDetailAppBar() {
  const navigation = useNavigation();

  return (
    <S.AppBar>
      <Pressable onPress={() => navigation.goBack()}>
        <S.BackButton>
          <LeftArrowIcon width={15} height={15} color={color.black} />
        </S.BackButton>
      </Pressable>
    </S.AppBar>
  );
}
