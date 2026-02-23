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
import PlaceReviewSection from '../components/PlaceReviewSection';
import {
  getFloorAccessibility,
  getAccessibilitySections,
} from '../components/PlaceInfo.utils';

/** Compute the chip list for the accessibility tab chip bar. */
export function getAccessibilityChips(
  accessibility?: AccessibilityInfoV2Dto,
): string[] {
  const placeAccessibilities =
    accessibility?.placeAccessibilities ??
    (accessibility?.placeAccessibility
      ? [accessibility.placeAccessibility]
      : []);
  if (placeAccessibilities.length === 0) return [];

  const pa = placeAccessibilities[0];
  const hasBuildingAccessibility =
    (accessibility?.buildingAccessibilities ?? []).length > 0 ||
    !!accessibility?.buildingAccessibility;
  const isStandalone = pa.isStandaloneBuilding === true;
  const doorDir = pa.doorDirectionType;
  const floors = pa.floors ?? [];
  const isMultiFloor = floors.length > 1;
  const hasV2Fields = pa.isStandaloneBuilding != null && doorDir != null;

  return getAccessibilitySections({
    isStandalone,
    doorDir,
    isMultiFloor,
    hasV2Fields,
    hasBuildingAccessibility,
  });
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
  // 다중 출입구 배열 지원 (하위 호환: 단일 필드 fallback)
  const placeAccessibilities =
    accessibility?.placeAccessibilities ??
    (accessibility?.placeAccessibility
      ? [accessibility.placeAccessibility]
      : []);
  const buildingAccessibilities =
    accessibility?.buildingAccessibilities ??
    (accessibility?.buildingAccessibility
      ? [accessibility.buildingAccessibility]
      : []);

  const hasPlaceAccessibility = placeAccessibilities.length > 0;
  const hasBuildingAccessibility = buildingAccessibilities.length > 0;

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

  const primaryPlaceAccessibility = placeAccessibilities[0];

  // V2 건물유형 분기 필드 (첫 번째 PA 기준)
  const isStandalone = primaryPlaceAccessibility.isStandaloneBuilding === true;
  const doorDir = primaryPlaceAccessibility.doorDirectionType;
  const floors = primaryPlaceAccessibility.floors ?? [];
  const isMultiFloor = floors.length > 1;
  const hasV2Fields =
    primaryPlaceAccessibility.isStandaloneBuilding != null && doorDir != null;

  const placeComments = accessibility?.placeAccessibilityComments ?? [];
  const buildingComments = accessibility?.buildingAccessibilityComments ?? [];

  // 섹션 순서/가시성을 공유 유틸리티로 결정
  const sections = getAccessibilitySections({
    isStandalone,
    doorDir,
    isMultiFloor,
    hasV2Fields,
    hasBuildingAccessibility,
  });

  // 층 정보 계산
  const floorInfo = getFloorAccessibility(accessibility as any);
  const floorDate = dayjs(primaryPlaceAccessibility.createdAt.value).format(
    'YYYY.MM.DD',
  );

  const sectionLayout =
    (name: string) => (e: {nativeEvent: {layout: {y: number}}}) => {
      onSectionLayout?.(name, e.nativeEvent.layout.y);
    };

  /** 매장 출입구 제목 (다중 출입구 시 번호 매김) */
  const placeEntranceTitle = (baseTitle: string, index: number) =>
    placeAccessibilities.length > 1 ? `${baseTitle} (${index + 1})` : baseTitle;

  /** 건물 출입구 제목 (다중 출입구 시 번호 매김) */
  const buildingEntranceTitle = (index: number) =>
    buildingAccessibilities.length > 1
      ? `건물 출입구 (${index + 1})`
      : '건물 출입구';

  return (
    <Container>
      {/* 섹션들 */}
      <SectionsContainer>
        {sections.map(section => {
          switch (section) {
            case '층 정보':
              return (
                <View key={section} onLayout={sectionLayout('층 정보')}>
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
              );
            case '건물 출입구':
              return (
                <View key={section} onLayout={sectionLayout('건물 출입구')}>
                  {hasBuildingAccessibility ? (
                    buildingAccessibilities.map((ba, index) => (
                      <BuildingEntranceSection
                        key={ba.id ?? index}
                        buildingDate={dayjs(
                          (ba as any).createdAt?.value ?? Date.now(),
                        ).format('YYYY.MM.DD')}
                        buildingAccessibility={ba}
                        accessibility={accessibility}
                        buildingComments={buildingComments}
                        title={buildingEntranceTitle(index)}
                      />
                    ))
                  ) : (
                    <BuildingEntranceEmptySection onRegister={onRegister} />
                  )}
                </View>
              );
            case '매장 출입구':
              return (
                <View key={section} onLayout={sectionLayout('매장 출입구')}>
                  {placeAccessibilities.map((pa, index) => (
                    <PlaceEntranceSection
                      key={pa.id ?? index}
                      title={
                        !hasV2Fields && hasBuildingAccessibility
                          ? placeEntranceTitle('매장 출입구 - 주 출입구', index)
                          : placeEntranceTitle('매장 출입구', index)
                      }
                      placeDate={dayjs(pa.createdAt.value).format('YYYY.MM.DD')}
                      placeAccessibility={pa}
                      accessibility={accessibility}
                      placeComments={placeComments}
                    />
                  ))}
                </View>
              );
            case '층간 이동 정보':
              return (
                <View key={section} onLayout={sectionLayout('층간 이동 정보')}>
                  <FloorMovementSection
                    placeAccessibility={primaryPlaceAccessibility}
                  />
                </View>
              );
            case '내부 이용 정보':
              return (
                <View key={section} onLayout={sectionLayout('내부 이용 정보')}>
                  <PlaceReviewSection
                    reviews={reviews}
                    onRegister={onRegister}
                  />
                </View>
              );
            default:
              return null;
          }
        })}
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
