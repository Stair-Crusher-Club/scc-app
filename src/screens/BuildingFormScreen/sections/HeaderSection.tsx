import React from 'react';
import {Text} from 'react-native';

import BuildingIcon from '@/assets/icon/ic_building.svg';
import TadaIcon from '@/assets/icon/ic_tada.svg';
import {color} from '@/constant/color';
import {Building, Place} from '@/generated-sources/openapi';

import * as S from './HeaderSection.style';

interface Props {
  place?: Place;
  building?: Building;
}
export default function HeaderSection({place, building}: Props) {
  return (
    <>
      <S.Discovered>
        <TadaIcon width={44} height={44} />
        <S.DiscoveredTitle>새로운 건물을 발견했어요!</S.DiscoveredTitle>
        <S.DiscoveredMessage>
          건물 입구와 엘리베이터 정보를 등록해 볼까요?
        </S.DiscoveredMessage>
      </S.Discovered>
      <S.HeaderSection>
        <S.NewPlace>
          <BuildingIcon width={24} height={24} />
          <S.NewPlaceText>새로운 건물</S.NewPlaceText>
        </S.NewPlace>
        <S.BuildingAddress>{building?.address}</S.BuildingAddress>
        <S.BoundedPlace>
          <Text style={{color: color.orange}}>{place?.name}</Text>
          <Text> 장소가 있는 건물</Text>
        </S.BoundedPlace>
      </S.HeaderSection>
    </>
  );
}
