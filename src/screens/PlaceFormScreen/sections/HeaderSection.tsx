import React from 'react';

import PlaceIcon from '@/assets/icon/ic_place.svg';
import {Place} from '@/generated-sources/openapi';

import * as S from './HeaderSection.style';

interface Props {
  place?: Place;
}
export default function HeaderSection({place}: Props) {
  return (
    <S.HeaderSection>
      <S.NewPlace>
        <PlaceIcon width={24} height={24} />
        <S.NewPlaceText>새로운 장소</S.NewPlaceText>
      </S.NewPlace>
      <S.PlaceName>{place?.name}</S.PlaceName>
      <S.Address>{place?.address}</S.Address>
    </S.HeaderSection>
  );
}
