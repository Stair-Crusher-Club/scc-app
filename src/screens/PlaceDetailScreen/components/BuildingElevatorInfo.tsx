import React from 'react';

import ElevatorDifficultIcon from '@/assets/icon/elevator_difficult.svg';
import ElevatorEasyIcon from '@/assets/icon/elevator_easy.svg';
import ElevatorNoneIcon from '@/assets/icon/elevator_not_exist.svg';
import {AccessibilityInfoV2Dto} from '@/generated-sources/openapi';

import EmptyInfo from './EmptyInfo';
import * as S from './PlaceInfo.style';
import {
  ElevatorType,
  getBuildingElevatorType,
  getStairDescription,
} from './PlaceInfo.utils';

interface Props {
  accessibility?: AccessibilityInfoV2Dto;
}
export default function BuildingElevatorInfo({accessibility}: Props) {
  if (!accessibility) {
    return <EmptyInfo type="엘리베이터 정보" />;
  }

  const elevatorType = getBuildingElevatorType(accessibility);
  const messages = getMessages(accessibility);

  return (
    <>
      <S.InfoContainer>
        <S.InfoWrapper>
          <S.Type>엘리베이터 정보</S.Type>
          <S.Title>{messages?.title}</S.Title>
          {messages?.description && (
            <S.Description>{messages?.description}</S.Description>
          )}
        </S.InfoWrapper>
        <S.DetailedIconWrapper>
          <DetailIcon elevatorType={elevatorType} />
        </S.DetailedIconWrapper>
      </S.InfoContainer>
    </>
  );
}

export function DetailIcon({elevatorType}: {elevatorType: ElevatorType}) {
  switch (elevatorType) {
    case ElevatorType.ElevatorAfterStair:
      return <ElevatorDifficultIcon width={32} height={32} color="black" />;
    case ElevatorType.ElevatorNoBarriers:
      return <ElevatorEasyIcon width={32} height={32} color="black" />;
    case ElevatorType.NoElevator:
      return <ElevatorNoneIcon width={32} height={32} color="black" />;
    default:
      return null;
  }
}

function getMessages(accessibility: AccessibilityInfoV2Dto) {
  const elevatorType = getBuildingElevatorType(accessibility);
  const stairInfo = accessibility.buildingAccessibility?.elevatorStairInfo;
  const stairHeightLevel =
    accessibility.buildingAccessibility?.elevatorStairHeightLevel;
  const description = getStairDescription(stairHeightLevel, stairInfo);

  switch (elevatorType) {
    case ElevatorType.ElevatorAfterStair:
      return {title: '엘리베이터 있음,\n가는 길에 계단 있음', description};
    case ElevatorType.ElevatorNoBarriers:
      return {title: '엘리베이터 있음'};
    case ElevatorType.NoElevator:
      return {title: '엘리베이터 없음'};
    default:
      return null;
  }
}
