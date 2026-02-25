import dayjs from 'dayjs';
import React from 'react';
import {Image} from 'react-native';
import styled from 'styled-components/native';

import PlusStrokeIcon from '@/assets/icon/ic_plus_stroke.svg';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {doorTypeMap} from '@/constant/options';
import {
  AccessibilityInfoV2Dto,
  BuildingAccessibilityComment,
  BuildingDoorDirectionTypeDto,
  PlaceAccessibilityComment,
  PlaceDoorDirectionTypeDto,
} from '@/generated-sources/openapi';

import {
  getFloorAccessibility,
  getPlaceEntranceStepType,
  getBuildingEntranceStepType,
  getBuildingElevatorType,
  getStairDescription,
  EntranceStepType,
  ElevatorType,
} from './PlaceInfo.utils';

// ──────────────── InfoRow ────────────────

export function InfoRow({
  label,
  value,
  subValue,
}: {
  label: string;
  value: string;
  subValue?: string;
}) {
  return (
    <InfoRowContainer>
      <InfoLabel>{label}</InfoLabel>
      <InfoValueContainer>
        <InfoValue>{value}</InfoValue>
        {subValue ? <InfoSubValue>{subValue}</InfoSubValue> : null}
      </InfoValueContainer>
    </InfoRowContainer>
  );
}

// ──────────────── PhotoRow ────────────────

export function PhotoRow({images}: {images: Array<{imageUrl: string}>}) {
  if (images.length === 0) {
    return null;
  }
  return (
    <PhotoRowContainer>
      {images.slice(0, 3).map((img, index) => (
        <PhotoThumbnail key={index} source={{uri: img.imageUrl}} />
      ))}
    </PhotoRowContainer>
  );
}

// ──────────────── CommentBox ────────────────

export function CommentBox({
  comments,
  registeredUserName,
}: {
  comments: PlaceAccessibilityComment[] | BuildingAccessibilityComment[];
  registeredUserName?: string;
}) {
  const latestComment = comments[0];
  if (!latestComment) {
    return null;
  }
  const userName = latestComment.user?.nickname ?? registeredUserName ?? '익명';
  const dateStr = dayjs(latestComment.createdAt.value).format('YYYY.MM.DD');

  return (
    <CommentContainer>
      <CommentText>{latestComment.comment}</CommentText>
      <CommentMetaRow>
        <CommentUserName>{userName}</CommentUserName>
        <CommentDate>{dateStr}</CommentDate>
      </CommentMetaRow>
    </CommentContainer>
  );
}

// ──────────────── Building Info Rows ────────────────

export function BuildingEntranceInfoRows({
  buildingAccessibility,
}: {
  buildingAccessibility: NonNullable<
    AccessibilityInfoV2Dto['buildingAccessibility']
  >;
}) {
  const entranceStepType = getBuildingEntranceStepType(buildingAccessibility);
  const stairInfo = buildingAccessibility.entranceStairInfo;
  const stairHeight = buildingAccessibility.entranceStairHeightLevel;
  const description = getStairDescription(stairHeight, stairInfo);

  let title = '';
  switch (entranceStepType) {
    case EntranceStepType.Flat:
      title = '계단, 경사로 없음';
      break;
    case EntranceStepType.SlopeOnly:
      title = '경사로 있음';
      break;
    case EntranceStepType.StairAndSlope:
      title = '계단과 경사로 있음';
      break;
    case EntranceStepType.StairOnly:
      title = '계단 있음';
      break;
  }

  return <InfoRow label="입구 정보" value={title} subValue={description} />;
}

export function BuildingElevatorInfoRow({
  buildingAccessibility,
}: {
  buildingAccessibility: NonNullable<
    AccessibilityInfoV2Dto['buildingAccessibility']
  >;
}) {
  if (!buildingAccessibility) return null;
  const elevatorType = getBuildingElevatorType(buildingAccessibility);
  const stairInfo = buildingAccessibility.elevatorStairInfo;
  const stairHeight = buildingAccessibility.elevatorStairHeightLevel;
  const description = getStairDescription(stairHeight, stairInfo);

  let title = '';
  switch (elevatorType) {
    case ElevatorType.ElevatorAfterStair:
      title = '엘리베이터 있지만,\n가는 길에 계단 있음';
      break;
    case ElevatorType.ElevatorNoBarriers:
      title = '엘리베이터 있음';
      break;
    case ElevatorType.NoElevator:
      title = '엘리베이터 없음';
      break;
  }

  return (
    <InfoRow label="엘리베이터 정보" value={title} subValue={description} />
  );
}

export function BuildingDoorInfoRow({
  buildingAccessibility,
}: {
  buildingAccessibility: NonNullable<
    AccessibilityInfoV2Dto['buildingAccessibility']
  >;
}) {
  const doorTypes = buildingAccessibility.entranceDoorTypes ?? [];
  if (doorTypes.length === 0) {
    return null;
  }
  const title = doorTypes.map(d => doorTypeMap[d]).join(', ');
  return <InfoRow label="출입문 유형" value={title} />;
}

export function BuildingDoorDirectionInfoRow({
  buildingAccessibility,
}: {
  buildingAccessibility: NonNullable<
    AccessibilityInfoV2Dto['buildingAccessibility']
  >;
}) {
  const doorDir = buildingAccessibility.doorDirectionType;
  if (!doorDir) {
    return null;
  }
  let title = '';
  switch (doorDir) {
    case BuildingDoorDirectionTypeDto.RoadDirection:
      title = '지상/보도 연결 문';
      break;
    case BuildingDoorDirectionTypeDto.ParkingDirection:
      title = '주차장 방향';
      break;
    case BuildingDoorDirectionTypeDto.Etc:
      title = '기타';
      break;
  }
  return <InfoRow label="출입구 방향" value={title} />;
}

// ──────────────── Place Info Rows ────────────────

export function PlaceEntranceInfoRows({
  placeAccessibility,
}: {
  placeAccessibility: NonNullable<AccessibilityInfoV2Dto['placeAccessibility']>;
}) {
  const entranceStepType = getPlaceEntranceStepType(placeAccessibility);
  const stairInfo = placeAccessibility.stairInfo;
  const stairHeight = placeAccessibility.stairHeightLevel;
  const description = getStairDescription(stairHeight, stairInfo);

  let title = '';
  switch (entranceStepType) {
    case EntranceStepType.Flat:
      title = '계단, 경사로 없음';
      break;
    case EntranceStepType.SlopeOnly:
      title = '경사로 있음';
      break;
    case EntranceStepType.StairAndSlope:
      title = '계단과 경사로 있음';
      break;
    case EntranceStepType.StairOnly:
      title = '계단 있음';
      break;
  }

  return <InfoRow label="입구 정보" value={title} subValue={description} />;
}

export function PlaceDoorInfoRow({
  placeAccessibility,
}: {
  placeAccessibility: NonNullable<AccessibilityInfoV2Dto['placeAccessibility']>;
}) {
  const doorTypes = placeAccessibility.entranceDoorTypes ?? [];
  if (doorTypes.length === 0) {
    return null;
  }
  const title = doorTypes.map(d => doorTypeMap[d]).join(', ');
  return <InfoRow label="출입문 유형" value={title} />;
}

export function PlaceDoorDirectionInfoRow({
  placeAccessibility,
}: {
  placeAccessibility: NonNullable<AccessibilityInfoV2Dto['placeAccessibility']>;
}) {
  const doorDir = placeAccessibility.doorDirectionType;
  if (!doorDir) {
    return null;
  }
  let title = '';
  switch (doorDir) {
    case PlaceDoorDirectionTypeDto.OutsideBuilding:
      title = '건물 밖';
      break;
    case PlaceDoorDirectionTypeDto.InsideBuilding:
      title = '건물 안';
      break;
  }
  return <InfoRow label="출입구 방향" value={title} />;
}

// ──────────────── PlaceNoteInfoRow (특이사항) ────────────────

export function PlaceNoteInfoRow({
  placeAccessibility,
}: {
  placeAccessibility: NonNullable<AccessibilityInfoV2Dto['placeAccessibility']>;
}) {
  const features = placeAccessibility.features;
  if (!features || features.length === 0) {
    return null;
  }
  return <InfoRow label="특이사항" value={features.join(', ')} />;
}

// ──────────────── FloorInfoRow ────────────────

export function FloorInfoRow({
  accessibility,
}: {
  accessibility?: AccessibilityInfoV2Dto;
}) {
  if (!accessibility?.placeAccessibility) {
    return null;
  }
  const floorInfo = getFloorAccessibility(accessibility as any);
  const floorDate = dayjs(
    accessibility.placeAccessibility.createdAt.value,
  ).format('YYYY.MM.DD');
  return (
    <AccessibilitySubSection>
      <SubSectionHeader>
        <SubSectionTitle>층 정보</SubSectionTitle>
        <SubSectionDate>{floorDate}</SubSectionDate>
      </SubSectionHeader>
      <InfoRowsContainer>
        <InfoRow
          label="층 정보"
          value={floorInfo.title}
          subValue={floorInfo.description}
        />
      </InfoRowsContainer>
    </AccessibilitySubSection>
  );
}

// ──────────────── StrokeCTAButton (H-48px Stroke + Left icon) ────────────────

export function StrokeCTAButton({
  text,
  onPress,
  elementName,
  fullWidth = false,
}: {
  text: string;
  onPress?: () => void;
  elementName: string;
  fullWidth?: boolean;
}) {
  return (
    <StrokeCTAContainer
      elementName={elementName}
      onPress={onPress}
      style={fullWidth ? {width: '100%'} : undefined}>
      <StrokeCTAContent>
        <PlusStrokeIcon width={20} height={20} color={color.brand40} />
        <StrokeCTAText>{text}</StrokeCTAText>
      </StrokeCTAContent>
    </StrokeCTAContainer>
  );
}

// ──────────────── EmptyStateCard ────────────────

export function EmptyStateCard({
  title,
  description,
  buttonText,
  onPress,
  elementName = 'empty_state_card_cta',
}: {
  title: string;
  description: string;
  buttonText: string;
  onPress?: () => void;
  elementName?: string;
}) {
  return (
    <EmptyStateCardContainer>
      <EmptyStateCardTextContainer>
        <EmptyStateCardTitle>{title}</EmptyStateCardTitle>
        <EmptyStateCardDescription>{description}</EmptyStateCardDescription>
      </EmptyStateCardTextContainer>
      <StrokeCTAButton
        text={buttonText}
        onPress={onPress}
        elementName={elementName}
        fullWidth
      />
    </EmptyStateCardContainer>
  );
}

// ──────────────── Styled Components ────────────────

// Empty state card
const EmptyStateCardContainer = styled.View`
  background-color: ${color.gray5};
  border-radius: 12px;
  padding: 20px;
  gap: 16px;
  align-items: center;
`;

const EmptyStateCardTitle = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 18px;
  line-height: 26px;
  letter-spacing: -0.36px;
  color: ${color.gray80};
  text-align: center;
`;

const EmptyStateCardTextContainer = styled.View`
  gap: 8px;
`;

const EmptyStateCardDescription = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 15px;
  line-height: 24px;
  letter-spacing: -0.3px;
  color: ${color.gray50};
  text-align: center;
`;

// StrokeCTAButton (Figma H-48px Stroke + Left icon)
const StrokeCTAContainer = styled(SccTouchableOpacity)`
  background-color: ${color.white};
  border-width: 1px;
  border-color: ${color.brand40};
  border-radius: 8px;
  padding-vertical: 12px;
  padding-horizontal: 28px;
  align-items: center;
  justify-content: center;
`;

const StrokeCTAContent = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
`;

const StrokeCTAText = styled.Text.attrs({
  style: {includeFontPadding: false, textAlignVertical: 'center'},
})`
  font-family: ${font.pretendardSemibold};
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -0.32px;
  color: ${color.brand40};
`;

// Subsection layout
export const AccessibilitySubSection = styled.View`
  gap: 12px;
`;

export const SubSectionHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const SubSectionTitle = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -0.32px;
  color: ${color.gray80};
`;

export const SubSectionDate = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 12px;
  line-height: 16px;
  letter-spacing: -0.24px;
  color: ${color.gray50};
`;

// Info rows
export const InfoRowsContainer = styled.View`
  gap: 12px;
`;

const InfoRowContainer = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
`;

const InfoLabel = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.28px;
  color: ${color.gray50};
  min-height: 26px;
  justify-content: center;
  padding-top: 3px;
`;

const InfoValueContainer = styled.View`
  align-items: flex-end;
  gap: 2px;
`;

const InfoValue = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 16px;
  line-height: 26px;
  letter-spacing: -0.32px;
  color: ${color.gray90};
  text-align: right;
`;

const InfoSubValue = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.28px;
  color: ${color.brand50};
`;

// Photos
const PhotoRowContainer = styled.View`
  flex-direction: row;
  gap: 4px;
`;

const PhotoThumbnail = styled(Image)`
  width: 114px;
  height: 114px;
  border-radius: 8px;
  background-color: #d9d9d9;
`;

// Comment
const CommentContainer = styled.View`
  background-color: ${color.gray5};
  border-radius: 12px;
  padding: 12px;
  gap: 6px;
`;

const CommentText = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 14px;
  line-height: 22px;
  letter-spacing: -0.28px;
  color: ${color.gray80};
`;

const CommentMetaRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const CommentUserName = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 12px;
  line-height: 16px;
  letter-spacing: -0.24px;
  color: ${color.brand50};
`;

const CommentDate = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 12px;
  line-height: 16px;
  letter-spacing: -0.24px;
  color: ${color.gray60};
`;

// Floor movement empty state
export const FloorMovementEmptyContainer = styled.View`
  background-color: ${color.gray5};
  border-radius: 12px;
  padding: 20px;
  align-items: center;
  justify-content: center;
`;

export const FloorMovementEmptyText = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 14px;
  line-height: 22px;
  letter-spacing: -0.28px;
  color: ${color.gray50};
`;
