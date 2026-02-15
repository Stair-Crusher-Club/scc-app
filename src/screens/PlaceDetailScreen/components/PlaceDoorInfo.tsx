import React from 'react';

import AutomaticDoorIcon from '@/assets/icon/door_automatic.svg';
import EtcDoorIcon from '@/assets/icon/door_etc.svg';
import HingedDoorIcon from '@/assets/icon/door_hinged.svg';
import NoneDoorIcon from '@/assets/icon/door_none.svg';
import RevolvingDoorIcon from '@/assets/icon/door_revolving.svg';
import SlidingDoorIcon from '@/assets/icon/door_sliding.svg';
import {doorTypeMap} from '@/constant/options';
import {
  AccessibilityInfoV2Dto,
  EntranceDoorType,
} from '@/generated-sources/openapi';

import EmptyInfo from './EmptyInfo';
import * as S from './PlaceInfo.style';

interface Props {
  accessibility?: AccessibilityInfoV2Dto;
}
export default function PlaceDoorInfo({accessibility}: Props) {
  // 장소 정보 자체가 없는 경우는 회색 체크 상태로 노출
  if (!accessibility) {
    return <EmptyInfo type="출입문 유형" />;
  }

  const doorTypes = accessibility.placeAccessibility?.entranceDoorTypes ?? [];
  const title = doorTypes.map(d => doorTypeMap[d]).join(', ');

  // 장소 정보는 있지만 출입문 유형이 없는 경우 - 과거에 등록된 데이터
  // 정보가 없으므로 노출하지 않는다
  if (doorTypes.length === 0) {
    return null;
  }

  return (
    <>
      <S.InfoContainer>
        <S.InfoWrapper>
          <S.Type>출입문 유형</S.Type>
          <S.Title>{title}</S.Title>
        </S.InfoWrapper>
        <S.DetailedIconWrapper>
          <DetailIcon doorType={doorTypes[0]} />
        </S.DetailedIconWrapper>
      </S.InfoContainer>
    </>
  );
}

export function DetailIcon({doorType}: {doorType: EntranceDoorType}) {
  switch (doorType) {
    case EntranceDoorType.Automatic:
      return (
        <AutomaticDoorIcon
          width={32}
          height={32}
          color="black"
          pointColor="#67AEFF"
        />
      );
    case EntranceDoorType.Hinged:
      return (
        <HingedDoorIcon
          width={32}
          height={32}
          color="black"
          pointColor="#67AEFF"
        />
      );
    case EntranceDoorType.Sliding:
      return (
        <SlidingDoorIcon
          width={32}
          height={32}
          color="black"
          pointColor="#67AEFF"
        />
      );
    case EntranceDoorType.Revolving:
      return (
        <RevolvingDoorIcon
          width={32}
          height={32}
          color="black"
          pointColor="#67AEFF"
        />
      );
    case EntranceDoorType.Etc:
      return (
        <EtcDoorIcon
          width={32}
          height={32}
          color="black"
          pointColor="#67AEFF"
        />
      );
    case EntranceDoorType.None:
      return (
        <NoneDoorIcon
          width={32}
          height={32}
          color="black"
          pointColor="#67AEFF"
        />
      );
    default:
      return null;
  }
}
