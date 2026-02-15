import React from 'react';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {AccessibilityInfoDto, StairInfo} from '@/generated-sources/openapi';

import {
  EntranceStepType,
  FloorAccessibilityType,
  getFloorAccessibility,
  getPlaceEntranceStepType,
} from '../components/PlaceInfo.utils';

interface Props {
  accessibility: AccessibilityInfoDto;
}

export default function AccessibilitySummarySection({accessibility}: Props) {
  const summary = generateSummary(accessibility);

  if (!summary) {
    return null;
  }

  return (
    <Container>
      <SummaryText>{summary}</SummaryText>
    </Container>
  );
}

function generateSummary(accessibility: AccessibilityInfoDto): string | null {
  if (!accessibility.placeAccessibility) {
    return null;
  }

  const parts: string[] = [];

  // 층 정보
  const floorInfo = getFloorAccessibility(accessibility);
  switch (floorInfo.type) {
    case FloorAccessibilityType.GroundFloor:
      parts.push('이 장소는 1층에 위치해 있어요.');
      break;
    case FloorAccessibilityType.GroundAndMoreFloors:
      parts.push(
        '이 장소는 1층을 포함한 여러 층에 걸쳐 있으며, 계단 외 이동 방법이 있어요.',
      );
      break;
    case FloorAccessibilityType.GroundAndMoreFloorsWithStairOnly:
      parts.push(
        '이 장소는 1층을 포함한 여러 층에 걸쳐 있지만, 계단으로만 이동할 수 있어요.',
      );
      break;
    case FloorAccessibilityType.UpperWithElevator:
      parts.push(
        `이 장소는 ${floorInfo.title}에 위치하며, 엘리베이터로 이동할 수 있어요.`,
      );
      break;
    case FloorAccessibilityType.UpperWithoutElevator:
      parts.push(
        `이 장소는 ${floorInfo.title}에 위치하며, 계단으로만 이동할 수 있어요.`,
      );
      break;
    case FloorAccessibilityType.UndergroundWithElevator:
      parts.push(
        `이 장소는 ${floorInfo.title}에 위치하며, 엘리베이터로 이동할 수 있어요.`,
      );
      break;
    case FloorAccessibilityType.UndergroundWithoutElevator:
      parts.push(
        `이 장소는 ${floorInfo.title}에 위치하며, 계단으로만 이동할 수 있어요.`,
      );
      break;
    case FloorAccessibilityType.UnknownButNotOnGround:
      parts.push('이 장소는 1층이 아닌 곳에 위치해 있어요.');
      break;
    default:
      break;
  }

  // 입구 정보
  const entranceType = getPlaceEntranceStepType(accessibility);
  switch (entranceType) {
    case EntranceStepType.Flat:
      parts.push('입구에 계단이나 경사로가 없어 접근이 편리해요.');
      break;
    case EntranceStepType.SlopeOnly:
      parts.push('입구에 경사로가 있어 휠체어 접근이 가능해요.');
      break;
    case EntranceStepType.StairAndSlope:
      parts.push('입구에 계단과 경사로가 있어요.');
      break;
    case EntranceStepType.StairOnly: {
      const stairInfo = accessibility.placeAccessibility?.stairInfo;
      if (stairInfo === StairInfo.One) {
        parts.push('입구에 1칸의 계단이 있어요.');
      } else {
        parts.push('입구에 계단이 있어 주의가 필요해요.');
      }
      break;
    }
    default:
      break;
  }

  if (parts.length === 0) {
    return null;
  }

  return parts.join(' ');
}

const Container = styled.View`
  background-color: ${color.brand5};
  border-radius: 12px;
  padding: 16px;
`;

const SummaryText = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 14px;
  line-height: 22px;
  color: ${color.gray70};
`;
