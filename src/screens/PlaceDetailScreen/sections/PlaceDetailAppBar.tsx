import {useNavigation} from '@react-navigation/core';
import React from 'react';

import {SccPressable} from '@/components/SccPressable';
import LeftArrowIcon from '@/assets/icon/ic_arrow_left.svg';
import {color} from '@/constant/color';

import * as S from './PlaceDetailAppBar.style';

export default function PlaceDetailAppBar() {
  const navigation = useNavigation();

  return (
    <S.AppBar>
      <SccPressable
        elementName="place_detail_back_button"
        onPress={() => navigation.goBack()}>
        <S.BackButton>
          <LeftArrowIcon width={24} height={24} color={color.black} />
        </S.BackButton>
      </SccPressable>
    </S.AppBar>
  );
}
