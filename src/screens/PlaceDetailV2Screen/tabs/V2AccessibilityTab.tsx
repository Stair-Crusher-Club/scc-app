import dayjs from 'dayjs';
import React from 'react';
import {ScrollView} from 'react-native';
import styled from 'styled-components/native';

import PlusIcon from '@/assets/icon/ic_plus.svg';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  AccessibilityInfoV2Dto,
  Building,
  Place,
  PlaceDoorDirectionTypeDto,
  PlaceReviewDto,
  ReportTargetTypeDto,
} from '@/generated-sources/openapi';

import {
  InfoRow,
  InfoRowsContainer,
} from '../components/AccessibilityInfoComponents';
import {
  BuildingEntranceSection,
  PlaceEntranceSection,
  FloorMovementSection,
} from '../components/EntranceSection';
import IndoorInfoSection from '../components/IndoorInfoSection';
import {getFloorAccessibility} from '../components/PlaceInfo.utils';

interface Props {
  accessibility?: AccessibilityInfoV2Dto;
  place: Place;
  building: Building;
  isAccessibilityRegistrable?: boolean;
  reviews?: PlaceReviewDto[];
  onRegister?: () => void;
  showNegativeFeedbackBottomSheet?: (type: ReportTargetTypeDto) => void;
  allowDuplicateRegistration?: boolean;
}

export default function V2AccessibilityTab({
  accessibility,
  reviews = [],
  onRegister,
}: Props) {
  const hasPlaceAccessibility = !!accessibility?.placeAccessibility;
  const hasBuildingAccessibility = !!accessibility?.buildingAccessibility;
  const hasIndoorReviews = reviews.length > 0;

  if (!hasPlaceAccessibility) {
    return (
      <EmptyStateContainer>
        <EmptyStateTextBlock>
          <EmptyStateTitle>
            {'아직 등록된 접근성 정보가 없어요🥲'}
          </EmptyStateTitle>
          <EmptyStateDescription>
            {'아래 버튼을 눌러주시면\n최대한 빨리 장소를 정복해볼게요!'}
          </EmptyStateDescription>
        </EmptyStateTextBlock>
        <EmptyStateCTAButton
          elementName="v2_accessibility_tab_empty_register"
          onPress={onRegister}>
          <PlusIcon width={20} height={20} color={color.brand40} />
          <EmptyStateCTAText>정보 등록하기</EmptyStateCTAText>
        </EmptyStateCTAButton>
      </EmptyStateContainer>
    );
  }

  const placeAccessibility = accessibility!.placeAccessibility!;
  const buildingAccessibility = accessibility?.buildingAccessibility;

  // V2 건물유형 분기 필드
  const isStandalone = placeAccessibility.isStandaloneBuilding === true;
  const doorDir = placeAccessibility.doorDirectionType;
  const floors = placeAccessibility.floors ?? [];
  const isMultiFloor = floors.length > 1;
  const hasV2Fields =
    placeAccessibility.isStandaloneBuilding != null && doorDir != null;

  // 서브탭 칩 목록 생성 (건물유형별 분기)
  const chips: string[] = ['층 정보'];

  if (hasV2Fields) {
    if (isStandalone) {
      // 단독건물: 매장(건물 출입구)
      chips.push('매장(건물 출입구)');
      if (isMultiFloor) {
        chips.push('층간 이동 정보');
      }
      chips.push('내부 이용 정보');
    } else if (doorDir === PlaceDoorDirectionTypeDto.OutsideBuilding) {
      // 비단독 + 외부문
      chips.push('매장 출입구');
      if (isMultiFloor) {
        chips.push('층간 이동 정보');
        chips.push('내부 이용 정보');
      }
    } else {
      // 비단독 + 내부문 (INSIDE_BUILDING)
      chips.push('건물 출입구');
      chips.push('매장 출입구');
      if (isMultiFloor) {
        chips.push('층간 이동 정보');
      }
      chips.push('내부 이용 정보');
    }
  } else {
    // Fallback: V2 필드가 없는 기존 데이터
    if (hasBuildingAccessibility) {
      chips.push('건물 출입구');
    }
    chips.push('매장 출입구');
    if (hasIndoorReviews) {
      chips.push('내부 이용 정보');
    }
  }
  const placeComments = accessibility?.placeAccessibilityComments ?? [];
  const buildingComments = accessibility?.buildingAccessibilityComments ?? [];

  // 층 정보 계산
  const floorInfo = getFloorAccessibility(accessibility as any);
  const floorDate = dayjs(placeAccessibility.createdAt.value).format(
    'YYYY.MM.DD',
  );

  // 건물 출입구 정보
  const buildingDate = buildingAccessibility
    ? dayjs(
        (buildingAccessibility as any).createdAt?.value ?? Date.now(),
      ).format('YYYY.MM.DD')
    : '';

  // 매장 출입구 정보
  const placeDate = dayjs(placeAccessibility.createdAt.value).format(
    'YYYY.MM.DD',
  );

  return (
    <Container>
      {/* 서브탭 칩 */}
      <ChipScrollContainer>
        <ChipRow>
          {chips.map(chip => (
            <Chip key={chip}>
              <ChipText>{chip}</ChipText>
            </Chip>
          ))}
        </ChipRow>
      </ChipScrollContainer>

      {/* 섹션들 */}
      <SectionsContainer>
        {/* 층 정보 (항상 첫 번째) */}
        <FloorSectionContainer>
          <FloorSectionHeader>
            <FloorSectionTitle>층 정보</FloorSectionTitle>
            <FloorSectionDate>{floorDate}</FloorSectionDate>
          </FloorSectionHeader>
          <InfoRowsContainer>
            <InfoRow
              label="층 정보"
              value={floorInfo.title}
              subValue={floorInfo.description}
            />
          </InfoRowsContainer>
        </FloorSectionContainer>

        {hasV2Fields ? (
          <>
            {isStandalone ? (
              <>
                {/* 단독건물: 매장(건물 출입구) */}
                <PlaceEntranceSection
                  title="매장(건물 출입구)"
                  placeDate={placeDate}
                  placeAccessibility={placeAccessibility}
                  accessibility={accessibility}
                  placeComments={placeComments}
                />
                {isMultiFloor && <FloorMovementSection placeAccessibility={placeAccessibility} />}
                <IndoorInfoSection reviews={reviews} />
              </>
            ) : doorDir === PlaceDoorDirectionTypeDto.OutsideBuilding ? (
              <>
                {/* 비단독 + 외부문 */}
                <PlaceEntranceSection
                  title="매장 출입구"
                  placeDate={placeDate}
                  placeAccessibility={placeAccessibility}
                  accessibility={accessibility}
                  placeComments={placeComments}
                />
                {isMultiFloor && (
                  <>
                    <FloorMovementSection placeAccessibility={placeAccessibility} />
                    <IndoorInfoSection reviews={reviews} />
                  </>
                )}
              </>
            ) : (
              <>
                {/* 비단독 + 내부문 (INSIDE_BUILDING) */}
                {hasBuildingAccessibility && buildingAccessibility && (
                  <BuildingEntranceSection
                    buildingDate={buildingDate}
                    buildingAccessibility={buildingAccessibility}
                    accessibility={accessibility}
                    buildingComments={buildingComments}
                  />
                )}
                <PlaceEntranceSection
                  title="매장 출입구"
                  placeDate={placeDate}
                  placeAccessibility={placeAccessibility}
                  accessibility={accessibility}
                  placeComments={placeComments}
                />
                {isMultiFloor && <FloorMovementSection placeAccessibility={placeAccessibility} />}
                <IndoorInfoSection reviews={reviews} />
              </>
            )}
          </>
        ) : (
          <>
            {/* Fallback: V2 필드 없는 기존 데이터 */}
            {hasBuildingAccessibility && buildingAccessibility && (
              <BuildingEntranceSection
                buildingDate={buildingDate}
                buildingAccessibility={buildingAccessibility}
                accessibility={accessibility}
                buildingComments={buildingComments}
              />
            )}
            <PlaceEntranceSection
              title={
                hasBuildingAccessibility
                  ? '매장 출입구 - 주 출입구'
                  : '매장 출입구'
              }
              placeDate={placeDate}
              placeAccessibility={placeAccessibility}
              accessibility={accessibility}
              placeComments={placeComments}
            />
            {hasIndoorReviews && <IndoorInfoSection reviews={reviews} />}
          </>
        )}
      </SectionsContainer>

      <BottomPadding />
    </Container>
  );
}

// ──────────────── 스타일 ────────────────

const Container = styled.View`
  background-color: ${color.white};
`;

// Empty state
const EmptyStateContainer = styled.View`
  background-color: ${color.gray5};
  padding-top: 40px;
  padding-horizontal: 20px;
  padding-bottom: 20px;
  gap: 16px;
`;

const EmptyStateTextBlock = styled.View`
  gap: 8px;
  align-items: center;
`;

const EmptyStateTitle = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 18px;
  line-height: 26px;
  letter-spacing: -0.36px;
  color: ${color.gray80};
  text-align: center;
`;

const EmptyStateDescription = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 15px;
  line-height: 24px;
  letter-spacing: -0.3px;
  color: ${color.gray50};
  text-align: center;
`;

const EmptyStateCTAButton = styled(SccTouchableOpacity)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background-color: ${color.white};
  border-width: 1px;
  border-color: ${color.brand40};
  border-radius: 8px;
  padding-vertical: 12px;
  padding-horizontal: 28px;
`;

const EmptyStateCTAText = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -0.32px;
  color: ${color.brand40};
`;

// 서브탭 칩
const ChipScrollContainer = styled(ScrollView).attrs({
  horizontal: true,
  showsHorizontalScrollIndicator: false,
  contentContainerStyle: {
    paddingHorizontal: 20,
    gap: 8,
  },
})`
  padding-top: 12px;
  padding-bottom: 4px;
`;

const ChipRow = styled.View`
  flex-direction: row;
  gap: 8px;
`;

const Chip = styled.View`
  border-width: 1px;
  border-color: ${color.gray20};
  border-radius: 100px;
  padding-horizontal: 14px;
  padding-vertical: 8px;
  background-color: ${color.white};
`;

const ChipText = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 13px;
  line-height: 18px;
  letter-spacing: -0.26px;
  color: ${color.gray90};
`;

// 섹션
const SectionsContainer = styled.View`
  padding: 20px;
  gap: 40px;
`;

// 층 정보 섹션 (로컬 - EntranceSection과 다른 구조)
const FloorSectionContainer = styled.View`
  gap: 16px;
`;

const FloorSectionHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const FloorSectionTitle = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 18px;
  line-height: 26px;
  letter-spacing: -0.36px;
  color: ${color.gray90};
`;

const FloorSectionDate = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 12px;
  line-height: 16px;
  letter-spacing: -0.24px;
  color: ${color.gray50};
`;

const BottomPadding = styled.View`
  height: 100px;
`;
