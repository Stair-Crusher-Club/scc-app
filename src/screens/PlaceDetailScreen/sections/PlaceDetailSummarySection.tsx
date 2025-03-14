import React from 'react';
import {Pressable} from 'react-native';

import ExportIcon from '@/assets/icon/export.svg';
import {AccessibilityInfoDto, Place} from '@/generated-sources/openapi';
import {LogClick} from '@/logging/LogClick';
import ShareUtils from '@/utils/ShareUtils';

import {DetailIcon as ElevatorIcon} from '../components/BuildingElevatorInfo';
import {DetailIcon as BuildingStepIcon} from '../components/BuildingEntranceStepInfo';
import {DetailIcon as StepIcon} from '../components/PlaceEntranceStepInfo';
import {DetailIcon as FloorIcon} from '../components/PlaceFloorInfo';
import {
  getPlaceEntranceStepType,
  getFloorAccessibility,
  getBuildingEntranceStepType,
  getBuildingElevatorType,
} from '../components/PlaceInfo.utils';
import * as S from './PlaceDetailSummarySection.style';

interface PlaceDetailSummarySectionProps {
  accessibility?: AccessibilityInfoDto;
  place: Place;
}

const PlaceDetailSummarySection = ({
  accessibility,
  place,
}: PlaceDetailSummarySectionProps) => {
  if (!accessibility?.placeAccessibility) {
    return null;
  }

  return (
    <S.Section>
      <S.SubSection>
        <S.Row>
          <S.SectionTitle>{place.name}</S.SectionTitle>
          <LogClick elementName="place_detail_share">
            <Pressable onPress={() => ShareUtils.sharePlace(place)}>
              <ExportIcon width={28} color="black" />
            </Pressable>
          </LogClick>
        </S.Row>
        <S.Address>{place.address}</S.Address>
      </S.SubSection>
      <S.Separator />
      <S.Row>
        <S.Summary>
          <S.SummaryTitle>매장 입구</S.SummaryTitle>
          <PlaceIcons accessibility={accessibility} />
        </S.Summary>
        <S.VerticalSeparator />
        <S.Summary>
          <S.SummaryTitle>건물 입구</S.SummaryTitle>
          <BuildingIcons accessibility={accessibility} />
        </S.Summary>
      </S.Row>
    </S.Section>
  );
};

export default PlaceDetailSummarySection;

function PlaceIcons({accessibility}: {accessibility: AccessibilityInfoDto}) {
  // 정보가 등록되지 않은 경우
  if (!accessibility.placeAccessibility) {
    return <S.Empty>-</S.Empty>;
  }

  const floorAccessibility = getFloorAccessibility(accessibility);
  const stepType = getPlaceEntranceStepType(accessibility);

  return (
    <>
      <FloorIcon floorAccessibility={floorAccessibility} />
      <StepIcon entranceStepType={stepType} />
    </>
  );
}

function BuildingIcons({accessibility}: {accessibility: AccessibilityInfoDto}) {
  // 정보가 등록되지 않은 경우
  if (!accessibility.buildingAccessibility) {
    return <S.Empty>-</S.Empty>;
  }

  const entrannceType = getBuildingEntranceStepType(accessibility);
  const elevatorType = getBuildingElevatorType(accessibility);

  return (
    <>
      <BuildingStepIcon entranceStepType={entrannceType} />
      <ElevatorIcon elevatorType={elevatorType} />
    </>
  );
}
