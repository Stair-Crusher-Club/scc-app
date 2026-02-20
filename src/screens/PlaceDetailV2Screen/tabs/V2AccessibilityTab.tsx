import dayjs from 'dayjs';
import React from 'react';
import {View} from 'react-native';
import styled from 'styled-components/native';

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
  StrokeCTAButton,
} from '../components/AccessibilityInfoComponents';
import {
  BuildingEntranceSection,
  BuildingEntranceEmptySection,
  PlaceEntranceSection,
  FloorMovementSection,
} from '../components/EntranceSection';
import IndoorInfoSection from '../components/IndoorInfoSection';
import {getFloorAccessibility} from '../components/PlaceInfo.utils';

/** Compute the chip list for the accessibility tab chip bar. */
export function getAccessibilityChips(
  accessibility?: AccessibilityInfoV2Dto,
): string[] {
  if (!accessibility?.placeAccessibility) return [];

  const pa = accessibility.placeAccessibility;
  const hasBuildingAccessibility = !!accessibility.buildingAccessibility;
  const isStandalone = pa.isStandaloneBuilding === true;
  const doorDir = pa.doorDirectionType;
  const floors = pa.floors ?? [];
  const isMultiFloor = floors.length > 1;
  const hasV2Fields = pa.isStandaloneBuilding != null && doorDir != null;

  const chips: string[] = ['층 정보'];

  if (hasV2Fields) {
    if (isStandalone) {
      chips.push('매장(건물 출입구)');
      if (isMultiFloor) chips.push('층간 이동 정보');
      chips.push('내부 이용 정보');
    } else if (doorDir === PlaceDoorDirectionTypeDto.OutsideBuilding) {
      chips.push('매장 출입구');
      if (isMultiFloor) chips.push('층간 이동 정보');
      chips.push('내부 이용 정보');
    } else {
      chips.push('건물 출입구');
      chips.push('매장 출입구');
      if (isMultiFloor) chips.push('층간 이동 정보');
      chips.push('내부 이용 정보');
    }
  } else {
    if (hasBuildingAccessibility) chips.push('건물 출입구');
    chips.push('매장 출입구');
    chips.push('내부 이용 정보');
  }

  return chips;
}

interface Props {
  accessibility?: AccessibilityInfoV2Dto;
  place: Place;
  building: Building;
  isAccessibilityRegistrable?: boolean;
  reviews?: PlaceReviewDto[];
  onRegister?: () => void;
  showNegativeFeedbackBottomSheet?: (type: ReportTargetTypeDto) => void;
  allowDuplicateRegistration?: boolean;
  onSectionLayout?: (chipName: string, y: number) => void;
}

export default function V2AccessibilityTab({
  accessibility,
  reviews = [],
  onRegister,
  onSectionLayout,
}: Props) {
  const hasPlaceAccessibility = !!accessibility?.placeAccessibility;
  const hasBuildingAccessibility = !!accessibility?.buildingAccessibility;

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
        <StrokeCTAButton
          text="정보 등록하기"
          onPress={onRegister}
          elementName="v2_accessibility_tab_empty_register"
        />
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

  const sectionLayout =
    (name: string) => (e: {nativeEvent: {layout: {y: number}}}) => {
      onSectionLayout?.(name, e.nativeEvent.layout.y);
    };

  return (
    <Container>
      {/* 섹션들 */}
      <SectionsContainer>
        {/* 층 정보 (항상 첫 번째) */}
        <View onLayout={sectionLayout('층 정보')}>
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
        </View>

        {hasV2Fields ? (
          <>
            {isStandalone ? (
              <>
                {/* 단독건물: 매장(건물 출입구) */}
                <View onLayout={sectionLayout('매장(건물 출입구)')}>
                  <PlaceEntranceSection
                    title="매장(건물 출입구)"
                    placeDate={placeDate}
                    placeAccessibility={placeAccessibility}
                    accessibility={accessibility}
                    placeComments={placeComments}
                  />
                </View>
                {isMultiFloor && (
                  <View onLayout={sectionLayout('층간 이동 정보')}>
                    <FloorMovementSection
                      placeAccessibility={placeAccessibility}
                    />
                  </View>
                )}
                <View onLayout={sectionLayout('내부 이용 정보')}>
                  <IndoorInfoSection
                    reviews={reviews}
                    onRegister={onRegister}
                  />
                </View>
              </>
            ) : doorDir === PlaceDoorDirectionTypeDto.OutsideBuilding ? (
              <>
                {/* 비단독 + 외부문 */}
                <View onLayout={sectionLayout('매장 출입구')}>
                  <PlaceEntranceSection
                    title="매장 출입구"
                    placeDate={placeDate}
                    placeAccessibility={placeAccessibility}
                    accessibility={accessibility}
                    placeComments={placeComments}
                  />
                </View>
                {isMultiFloor && (
                  <View onLayout={sectionLayout('층간 이동 정보')}>
                    <FloorMovementSection
                      placeAccessibility={placeAccessibility}
                    />
                  </View>
                )}
                <View onLayout={sectionLayout('내부 이용 정보')}>
                  <IndoorInfoSection
                    reviews={reviews}
                    onRegister={onRegister}
                  />
                </View>
              </>
            ) : (
              <>
                {/* 비단독 + 내부문 (INSIDE_BUILDING) */}
                <View onLayout={sectionLayout('건물 출입구')}>
                  {hasBuildingAccessibility && buildingAccessibility ? (
                    <BuildingEntranceSection
                      buildingDate={buildingDate}
                      buildingAccessibility={buildingAccessibility}
                      accessibility={accessibility}
                      buildingComments={buildingComments}
                    />
                  ) : (
                    <BuildingEntranceEmptySection onRegister={onRegister} />
                  )}
                </View>
                <View onLayout={sectionLayout('매장 출입구')}>
                  <PlaceEntranceSection
                    title="매장 출입구"
                    placeDate={placeDate}
                    placeAccessibility={placeAccessibility}
                    accessibility={accessibility}
                    placeComments={placeComments}
                  />
                </View>
                {isMultiFloor && (
                  <View onLayout={sectionLayout('층간 이동 정보')}>
                    <FloorMovementSection
                      placeAccessibility={placeAccessibility}
                    />
                  </View>
                )}
                <View onLayout={sectionLayout('내부 이용 정보')}>
                  <IndoorInfoSection
                    reviews={reviews}
                    onRegister={onRegister}
                  />
                </View>
              </>
            )}
          </>
        ) : (
          <>
            {/* Fallback: V2 필드 없는 기존 데이터 */}
            {hasBuildingAccessibility && buildingAccessibility && (
              <View onLayout={sectionLayout('건물 출입구')}>
                <BuildingEntranceSection
                  buildingDate={buildingDate}
                  buildingAccessibility={buildingAccessibility}
                  accessibility={accessibility}
                  buildingComments={buildingComments}
                />
              </View>
            )}
            <View onLayout={sectionLayout('매장 출입구')}>
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
            </View>
            <View onLayout={sectionLayout('내부 이용 정보')}>
              <IndoorInfoSection reviews={reviews} onRegister={onRegister} />
            </View>
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
