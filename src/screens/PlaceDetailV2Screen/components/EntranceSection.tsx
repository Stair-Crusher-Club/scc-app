import React from 'react';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  AccessibilityInfoV2Dto,
  BuildingAccessibilityComment,
  FloorMovingMethodTypeDto,
  PlaceAccessibility,
  PlaceAccessibilityComment,
  StairInfo,
} from '@/generated-sources/openapi';

import {
  InfoRow,
  PhotoRow,
  CommentBox,
  BuildingDoorDirectionInfoRow,
  BuildingEntranceInfoRows,
  BuildingElevatorInfoRow,
  BuildingDoorInfoRow,
  PlaceDoorDirectionInfoRow,
  PlaceEntranceInfoRows,
  PlaceDoorInfoRow,
  PlaceNoteInfoRow,
  InfoRowsContainer,
  FloorMovementEmptyContainer,
  FloorMovementEmptyText,
  EmptyStateCard,
} from './AccessibilityInfoComponents';
import {getStairDescription} from './PlaceInfo.utils';

// ──────────────── BuildingEntranceSection ────────────────

export function BuildingEntranceSection({
  buildingDate,
  buildingAccessibility,
  buildingComments,
  compact = false,
  title = '건물 출입구',
}: {
  buildingDate: string;
  buildingAccessibility: NonNullable<
    AccessibilityInfoV2Dto['buildingAccessibility']
  >;
  buildingComments: BuildingAccessibilityComment[];
  compact?: boolean;
  title?: string;
}) {
  const Container = compact ? CompactSectionContainer : SectionContainer;
  const TitleComponent = compact ? CompactSectionTitle : SectionTitle;

  const doorDirectionEtcComment = (buildingAccessibility as any)
    .doorDirectionEtcComment as string | undefined;

  return (
    <Container>
      <SectionHeader>
        <TitleComponent>{title}</TitleComponent>
        <SectionDate>{buildingDate}</SectionDate>
      </SectionHeader>

      <SectionContent>
        <PhotoRow
          images={[
            ...(buildingAccessibility.entranceImages ?? []),
            ...(buildingAccessibility.elevatorImages ?? []),
          ]}
        />
        <InfoRowsContainer>
          <BuildingDoorDirectionInfoRow
            buildingAccessibility={buildingAccessibility}
          />
          <BuildingEntranceInfoRows
            buildingAccessibility={buildingAccessibility}
          />
          <BuildingElevatorInfoRow
            buildingAccessibility={buildingAccessibility}
          />
          <BuildingDoorInfoRow buildingAccessibility={buildingAccessibility} />
        </InfoRowsContainer>
        {doorDirectionEtcComment != null &&
          doorDirectionEtcComment.length > 0 && (
            <InlineComment>{doorDirectionEtcComment}</InlineComment>
          )}
        {buildingComments.length > 0 && (
          <CommentBox
            comments={buildingComments}
            registeredUserName={buildingAccessibility.registeredUserName}
          />
        )}
      </SectionContent>
    </Container>
  );
}

// ──────────────── BuildingEntranceEmptySection ────────────────

export function BuildingEntranceEmptySection({
  compact = false,
  onRegister,
}: {
  compact?: boolean;
  onRegister?: () => void;
}) {
  const Container = compact ? CompactSectionContainer : SectionContainer;
  const Title = compact ? CompactSectionTitle : SectionTitle;

  return (
    <Container>
      <SectionHeader>
        <Title>건물 출입구</Title>
      </SectionHeader>
      <EmptyStateCard
        title={'아직 등록된 건물 정보가 없어요🥲'}
        description={'건물 정보가 없으면\n정확한 접근성을 확인할 수 없어요.'}
        buttonText="건물정보 등록"
        onPress={onRegister}
      />
    </Container>
  );
}

// ──────────────── PlaceEntranceSection ────────────────

export function PlaceEntranceSection({
  title,
  placeDate,
  placeAccessibility,
  placeComments,
  compact = false,
}: {
  title: string;
  placeDate: string;
  placeAccessibility: NonNullable<AccessibilityInfoV2Dto['placeAccessibility']>;
  placeComments: PlaceAccessibilityComment[];
  compact?: boolean;
}) {
  const Container = compact ? CompactSectionContainer : SectionContainer;
  const TitleComponent = compact ? CompactSectionTitle : SectionTitle;

  const entranceComment = placeAccessibility.entranceComment;

  return (
    <Container>
      <SectionHeader>
        <TitleComponent>{title}</TitleComponent>
        <SectionDate>{placeDate}</SectionDate>
      </SectionHeader>

      <SectionContent>
        <PhotoRow images={placeAccessibility.images ?? []} />
        <InfoRowsContainer>
          <PlaceDoorDirectionInfoRow placeAccessibility={placeAccessibility} />
          <PlaceEntranceInfoRows placeAccessibility={placeAccessibility} />
          <PlaceDoorInfoRow placeAccessibility={placeAccessibility} />
          <PlaceNoteInfoRow placeAccessibility={placeAccessibility} />
        </InfoRowsContainer>
        {entranceComment != null && entranceComment.length > 0 && (
          <InlineComment>{entranceComment}</InlineComment>
        )}
        {placeComments.length > 0 && (
          <CommentBox
            comments={placeComments}
            registeredUserName={placeAccessibility.registeredUserName}
          />
        )}
      </SectionContent>
    </Container>
  );
}

// ──────────────── FloorMovementSection ────────────────

const FLOOR_MOVING_METHOD_LABELS: Record<FloorMovingMethodTypeDto, string> = {
  [FloorMovingMethodTypeDto.PlaceElevator]: '매장 엘리베이터',
  [FloorMovingMethodTypeDto.PlaceStairs]: '매장 계단',
  [FloorMovingMethodTypeDto.PlaceEscalator]: '매장 에스컬레이터',
  [FloorMovingMethodTypeDto.BuildingElevator]: '건물 엘리베이터',
  [FloorMovingMethodTypeDto.BuildingStairs]: '건물 계단',
  [FloorMovingMethodTypeDto.BuildingEscalator]: '건물 에스컬레이터',
  [FloorMovingMethodTypeDto.Unknown]: '기타',
};

function getElevatorStairTitle(
  stairInfo?: (typeof StairInfo)[keyof typeof StairInfo],
  hasSlope?: boolean,
): string {
  if (stairInfo === StairInfo.None || stairInfo === StairInfo.Undefined) {
    if (hasSlope) {
      return '경사로 있음';
    }
    return '계단, 경사로 없음';
  }
  if (hasSlope) {
    return '계단과 경사로 있음';
  }
  return '계단 있음';
}

export function FloorMovementSection({
  compact = false,
  placeAccessibility,
}: {
  compact?: boolean;
  placeAccessibility?: PlaceAccessibility;
}) {
  const Container = compact ? CompactSectionContainer : SectionContainer;
  const Title = compact ? CompactSectionTitle : SectionTitle;

  const methodTypes = placeAccessibility?.floorMovingMethodTypes;
  const elevatorAccessibility =
    placeAccessibility?.floorMovingElevatorAccessibility;
  const elevatorComment = placeAccessibility?.floorMovingElevatorComment;

  const hasData =
    (methodTypes && methodTypes.length > 0) ||
    elevatorAccessibility != null ||
    (elevatorComment != null && elevatorComment.length > 0);

  if (!hasData) {
    return (
      <Container>
        <SectionHeader>
          <Title>층간 이동 정보</Title>
        </SectionHeader>
        <FloorMovementEmptyContainer>
          <FloorMovementEmptyText>
            아직 등록된 층간 이동 정보가 없어요
          </FloorMovementEmptyText>
        </FloorMovementEmptyContainer>
      </Container>
    );
  }

  // 층간 이동 방법 텍스트
  const methodLabels =
    methodTypes?.map(m => FLOOR_MOVING_METHOD_LABELS[m]).join(', ') ?? '';

  // 엘리베이터 접근성 텍스트
  const elevatorStairTitle = elevatorAccessibility
    ? getElevatorStairTitle(
        elevatorAccessibility.stairInfo,
        elevatorAccessibility.hasSlope,
      )
    : '';
  const elevatorStairDescription = elevatorAccessibility
    ? getStairDescription(
        elevatorAccessibility.stairHeightLevel,
        elevatorAccessibility.stairInfo,
      )
    : '';

  // 엘리베이터 이미지
  const elevatorImages = (elevatorAccessibility?.imageUrls ?? []).map(url => ({
    imageUrl: url,
  }));

  return (
    <Container>
      <SectionHeader>
        <Title>층간 이동 정보</Title>
      </SectionHeader>

      <SectionContent>
        <PhotoRow images={elevatorImages} />
        <InfoRowsContainer>
          {methodLabels.length > 0 && (
            <InfoRow label="이동 방법" value={methodLabels} />
          )}
          {elevatorAccessibility && elevatorStairTitle.length > 0 && (
            <InfoRow
              label="엘리베이터 정보"
              value={elevatorStairTitle}
              subValue={elevatorStairDescription}
            />
          )}
        </InfoRowsContainer>
        {elevatorComment != null && elevatorComment.length > 0 && (
          <InlineComment>{elevatorComment}</InlineComment>
        )}
      </SectionContent>
    </Container>
  );
}

// ──────────────── Styled Components ────────────────

// Full-size variant (AccessibilityTab)
const SectionContainer = styled.View`
  gap: 16px;
`;

const SectionContent = styled.View`
  gap: 16px;
`;

const SectionHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const SectionTitle = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 18px;
  line-height: 26px;
  letter-spacing: -0.36px;
  color: ${color.gray90};
`;

const SectionDate = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 12px;
  line-height: 16px;
  letter-spacing: -0.24px;
  color: ${color.gray50};
`;

// Compact variant (HomeTab subsection)
const CompactSectionContainer = styled.View`
  gap: 12px;
`;

const CompactSectionTitle = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -0.32px;
  color: ${color.gray80};
`;

const InlineComment = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 14px;
  line-height: 22px;
  letter-spacing: -0.28px;
  color: ${color.gray70};
`;
