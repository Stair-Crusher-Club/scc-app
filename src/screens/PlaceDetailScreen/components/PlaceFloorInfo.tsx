import React from 'react';

import Floor1FIcon from '@/assets/icon/floor_1f.svg';
import Floor1FPlusBadIcon from '@/assets/icon/floor_1fplus_bad.svg';
import Floor1FPlusGoodIcon from '@/assets/icon/floor_1fplus_good.svg';
import FloorNot1FIcon from '@/assets/icon/floor_not_1f.svg';
import FloorUndergroundBadIcon from '@/assets/icon/floor_underground_bad.svg';
import FloorUndergroundGoodIcon from '@/assets/icon/floor_underground_good.svg';
import FloorUpperBadIcon from '@/assets/icon/floor_upper_bad.svg';
import FloorUpperGoodIcon from '@/assets/icon/floor_upper_good.svg';
import CheckIcon from '@/assets/icon/ic_check.svg';
import {AccessibilityInfoDto} from '@/generated-sources/openapi';

import * as S from './PlaceInfo.style';
import {FloorAccessibilityType, getFloorAccessibility} from './PlaceInfo.utils';

interface Props {
  accessibility?: AccessibilityInfoDto;
}

export default function PlaceFloorInfo({accessibility}: Props) {
  if (!accessibility) {
    return (
      <S.InfoContainer>
        <CheckIcon color="#D0D0D9" />
        <S.Title>층 정보</S.Title>
      </S.InfoContainer>
    );
  }

  const floorInfo = getFloorAccessibility(accessibility);
  return (
    <S.InfoContainer>
      <S.InfoWrapper>
        <S.Type>층 정보</S.Type>
        <S.Title>{floorInfo.title}</S.Title>
        {floorInfo.description && (
          <S.Description>{floorInfo.description}</S.Description>
        )}
      </S.InfoWrapper>
      <S.DetailedIconWrapper>
        <DetailIcon floorAccessibility={floorInfo.type} />
      </S.DetailedIconWrapper>
    </S.InfoContainer>
  );
}

export function DetailIcon({
  floorAccessibility,
}: {
  floorAccessibility: FloorAccessibilityType;
}) {
  switch (floorAccessibility) {
    case FloorAccessibilityType.GroundFloor:
      return <Floor1FIcon />;
    case FloorAccessibilityType.GroundAndMoreFloors:
      return <Floor1FPlusGoodIcon color="#000" />;
    case FloorAccessibilityType.GroundAndMoreFloorsWithStairOnly:
      return <Floor1FPlusBadIcon color="#000" />;
    case FloorAccessibilityType.UpperWithElevator:
      return <FloorUpperGoodIcon color="#000" />;
    case FloorAccessibilityType.UpperWithoutElevator:
      return <FloorUpperBadIcon color="#000" />;
    case FloorAccessibilityType.UndergroundWithElevator:
      return <FloorUndergroundGoodIcon color="#000" />;
    case FloorAccessibilityType.UndergroundWithoutElevator:
      return <FloorUndergroundBadIcon color="#000" />;
    case FloorAccessibilityType.UnknownButNotOnGround:
      return <FloorNot1FIcon color="#000" />;
    default:
      return null;
  }
}
