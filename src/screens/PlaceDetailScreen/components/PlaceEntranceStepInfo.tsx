import React from 'react';

import CheckIcon from '@/assets/icon/ic_check.svg';
import StepFlatIcon from '@/assets/icon/step_flat.svg';
import StepSlopeIcon from '@/assets/icon/step_slope.svg';
import StepStairIcon from '@/assets/icon/step_stair.svg';
import {AccessibilityInfoDto} from '@/generated-sources/openapi';

import * as S from './PlaceInfo.style';
import {
  EntranceStepType,
  getPlaceEntranceStepType,
  getStairDescription,
} from './PlaceInfo.utils';

interface Props {
  accessibility?: AccessibilityInfoDto;
}
export default function PlaceEntranceStepInfo({accessibility}: Props) {
  if (!accessibility) {
    return (
      <S.InfoContainer>
        <CheckIcon color="#D0D0D9" />
        <S.Title>입구 정보</S.Title>
      </S.InfoContainer>
    );
  }

  const entranceStepType = getPlaceEntranceStepType(accessibility);
  const messages = getMessages(accessibility);

  return (
    <>
      <S.InfoContainer>
        <S.InfoWrapper>
          <S.Type>입구 정보</S.Type>
          <S.Title>{messages?.title}</S.Title>
          {messages?.description && (
            <S.Description>{messages?.description}</S.Description>
          )}
        </S.InfoWrapper>
        <S.DetailedIconWrapper>
          <DetailIcon entranceStepType={entranceStepType} />
        </S.DetailedIconWrapper>
      </S.InfoContainer>
    </>
  );
}

export function DetailIcon({
  entranceStepType,
}: {
  entranceStepType: EntranceStepType;
}) {
  switch (entranceStepType) {
    case EntranceStepType.Flat:
      return <StepFlatIcon color="#000" />;
    case EntranceStepType.SlopeOnly:
      return <StepSlopeIcon color="#000" />;
    case EntranceStepType.StairAndSlope:
      return <StepSlopeIcon color="#000" />;
    case EntranceStepType.StairOnly:
      return <StepStairIcon color="#000" />;
    default:
      return null;
  }
}

function getMessages(accessibility: AccessibilityInfoDto) {
  const entranceStepType = getPlaceEntranceStepType(accessibility);
  const stairInfo = accessibility.placeAccessibility?.stairInfo;
  const stairHeightLevel = accessibility.placeAccessibility?.stairHeightLevel;
  const description = getStairDescription(stairHeightLevel, stairInfo);

  switch (entranceStepType) {
    case EntranceStepType.Flat:
      return {title: '계단, 경사로 없음'};
    case EntranceStepType.SlopeOnly:
      return {title: '경사로 있음'};
    case EntranceStepType.StairAndSlope:
      return {
        title: '계단과 경사로 있음',
        description,
      };
    case EntranceStepType.StairOnly:
      return {
        title: '계단 있음',
        description,
      };
    default:
      return null;
  }
}
