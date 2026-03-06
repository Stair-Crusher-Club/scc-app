import dayjs from 'dayjs';
import React from 'react';
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
  EmptyStateCard,
  InfoRow,
  InfoRowsContainer,
} from '../components/AccessibilityInfoComponents';
import AccessibilityCommentSection from '../components/AccessibilityCommentSection';
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
    showBuildingEntranceForOutsideDoor: true,
  });
}

interface Props {
  accessibility?: AccessibilityInfoV2Dto;
  place: Place;
  building: Building;
  isAccessibilityRegistrable?: boolean;
  reviews?: PlaceReviewDto[];
  onRegister?: () => void;
  onBuildingRegister?: () => void;
  onAddPlaceComment?: () => void;
  onAddBuildingComment?: () => void;
  showNegativeFeedbackBottomSheet?: (type: ReportTargetTypeDto) => void;
  allowDuplicateRegistration?: boolean;
  onSectionLayout?: (chipName: string, y: number) => void;
}

export default function V2AccessibilityTab({
  accessibility,
  reviews = [],
  onRegister,
  onBuildingRegister,
  onAddPlaceComment,
  onAddBuildingComment,
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
      <EmptyStateWrapper>
        <EmptyStateCard
          title={'아직 등록된 접근성 정보가 없어요🥲'}
          description={
            '아래 버튼을 눌러주시면\n최대한 빨리 장소를 정복해볼게요!'
          }
          buttonText="정보 등록하기"
          onPress={onRegister}
          elementName="v2_accessibility_tab_empty_register"
        />
      </EmptyStateWrapper>
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

  // 섹션 순서/가시성을 공유 유틸리티로 결정
  const sections = getAccessibilitySections({
    isStandalone,
    doorDir,
    isMultiFloor,
    hasV2Fields,
    hasBuildingAccessibility,
    showBuildingEntranceForOutsideDoor: true,
  });

  // 층 정보 계산
  const floorInfo = getFloorAccessibility(
    accessibility as any,
    primaryPlaceAccessibility.doorDirectionType,
  );
  const floorDate = dayjs(primaryPlaceAccessibility.createdAt.value).format(
    'YYYY.MM.DD',
  );

  const sectionLayout =
    (name: string) => (e: {nativeEvent: {layout: {y: number}}}) => {
      onSectionLayout?.(name, e.nativeEvent.layout.y);
    };

  /** 매장 출입구 제목 (다중 출입구 시 번호 매김, 1개면 항상 '매장 출입구') */
  const placeEntranceTitle = (baseTitle: string, index: number) =>
    placeAccessibilities.length > 1
      ? `${baseTitle} (${index + 1})`
      : '매장 출입구';

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
                <SectionsInnerContainer
                  key={section}
                  onLayout={sectionLayout('층 정보')}>
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
                </SectionsInnerContainer>
              );
            case '건물 출입구':
              return (
                <SectionsInnerContainer
                  key={section}
                  onLayout={sectionLayout('건물 출입구')}>
                  {hasBuildingAccessibility ? (
                    buildingAccessibilities.map((ba, index) => (
                      <BuildingEntranceSection
                        key={ba.id ?? index}
                        buildingDate={dayjs(
                          (ba as any).createdAt?.value ?? Date.now(),
                        ).format('YYYY.MM.DD')}
                        buildingAccessibility={ba}
                        title={buildingEntranceTitle(index)}>
                        {index === buildingAccessibilities.length - 1 && (
                          <AccessibilityCommentSection
                            comments={
                              accessibility?.buildingAccessibilityComments ?? []
                            }
                            buttonText="건물입구 접근성 정보 의견 남기기"
                            onAddComment={onAddBuildingComment}
                            elementName="v2_accessibility_building_comment"
                          />
                        )}
                      </BuildingEntranceSection>
                    ))
                  ) : (
                    <BuildingEntranceEmptySection
                      onRegister={onBuildingRegister}
                    />
                  )}
                </SectionsInnerContainer>
              );
            case '매장 출입구':
              return (
                <SectionsInnerContainer
                  key={section}
                  onLayout={sectionLayout('매장 출입구')}>
                  {placeAccessibilities.map((pa, index) => (
                    <PlaceEntranceSection
                      key={pa.id ?? index}
                      title={placeEntranceTitle('매장 출입구', index)}
                      placeDate={dayjs(pa.createdAt.value).format('YYYY.MM.DD')}
                      placeAccessibility={pa}>
                      {index === placeAccessibilities.length - 1 && (
                        <AccessibilityCommentSection
                          comments={
                            accessibility?.placeAccessibilityComments ?? []
                          }
                          buttonText="매장입구 접근성 정보 의견 남기기"
                          onAddComment={onAddPlaceComment}
                          elementName="v2_accessibility_place_comment"
                          registrationComments={placeAccessibilities
                            .map(p => p.entranceComment)
                            .filter((c): c is string => c != null && c.length > 0)}
                        />
                      )}
                    </PlaceEntranceSection>
                  ))}
                </SectionsInnerContainer>
              );
            case '층간 이동 정보':
              return (
                <SectionsInnerContainer
                  key={section}
                  onLayout={sectionLayout('층간 이동 정보')}>
                  <FloorMovementSection
                    placeAccessibility={primaryPlaceAccessibility}
                  />
                </SectionsInnerContainer>
              );
            case '내부 이용 정보':
              return (
                <SectionsInnerContainer
                  key={section}
                  onLayout={sectionLayout('내부 이용 정보')}>
                  <PlaceReviewSection
                    reviews={reviews}
                    onRegister={onRegister}
                  />
                </SectionsInnerContainer>
              );
            default:
              return null;
          }
        })}
      </SectionsContainer>
    </Container>
  );
}

// ──────────────── 스타일 ────────────────

const Container = styled.View`
  background-color: ${color.white};
`;

// Empty state
const EmptyStateWrapper = styled.View`
  flex: 1;
  background-color: ${color.gray5};
  padding-top: 20px;
`;

// 섹션
const SectionsContainer = styled.View`
  padding: 20px;
  gap: 40px;
`;

const SectionsInnerContainer = styled.View`
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
