import React from 'react';
import {LayoutChangeEvent} from 'react-native';
import styled from 'styled-components/native';

import ReviewOutlineIcon from '@/assets/icon/ic_review_outline.svg';
import {BadgeShell, BadgeText} from '@/components/BadgeShell';
import PlaceTags from '@/components/PlaceTags';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  AccessibilityInfoV2Dto,
  Place,
  PlaceTagDto,
} from '@/generated-sources/openapi';

type ScoreStatus = '0' | '1' | '2' | '3' | '4' | '5' | 'unknown' | 'progress';

const ScoreColorMap: Record<
  ScoreStatus,
  {background: string; text: string; border?: string}
> = {
  '0': {background: '#E6F4EB', text: '#06903B'},
  '1': {background: '#F0F9E7', text: '#64C40F'},
  '2': {background: '#FFF9E6', text: '#FFC109'},
  '3': {background: '#FFF4E6', text: '#FF9202'},
  '4': {background: '#FFEEE9', text: '#FF5722'},
  '5': {background: '#FCE9E9', text: '#E52123'},
  unknown: {background: '#E7E8E9', text: '#9A9B9F'},
  progress: {background: '#ffffff', text: '#FFC109', border: '#FFC109'},
};

function getScoreStatus(
  score?: number | null,
  isProcessing?: boolean,
): ScoreStatus {
  if (isProcessing) {
    return 'progress';
  } else if (score === undefined || score === null) {
    return 'unknown';
  } else if (score <= 0) {
    return '0';
  } else if (score <= 1) {
    return '1';
  } else if (score <= 2) {
    return '2';
  } else if (score <= 3) {
    return '3';
  } else if (score <= 4) {
    return '4';
  } else {
    return '5';
  }
}

interface V2SummarySectionProps {
  place: Place;
  accessibilityScore?: number;
  accessibility?: AccessibilityInfoV2Dto;
  reviewCount: number;
  placeTags?: PlaceTagDto[];
  onNameLayout?: (event: LayoutChangeEvent) => void;
}

export default function V2SummarySection({
  place,
  accessibilityScore,
  accessibility,
  reviewCount,
  placeTags,
  onNameLayout,
}: V2SummarySectionProps) {
  const hasScore =
    accessibilityScore !== undefined && accessibilityScore !== null;

  const isProcessing =
    !hasScore &&
    !!accessibility?.placeAccessibility &&
    !accessibility?.buildingAccessibility;

  const scoreStatus = getScoreStatus(accessibilityScore, isProcessing);

  const tagTexts = (() => {
    const pa = accessibility?.placeAccessibility;
    if (!pa) {
      return [];
    }

    let floorTag;
    let slopeTag;

    const floors = pa.floors ?? [];
    const floorText = floors.length
      ? floors[0] < 0
        ? `지하 ${-floors[0]}`
        : `${floors[0]}`
      : undefined;
    floorTag = floorText
      ? `${floorText}층${floors.length > 1 ? '+' : ''}`
      : undefined;

    slopeTag = pa.hasSlope
      ? '경사로있음'
      : !pa.hasSlope && (accessibilityScore ?? 0) !== 0
        ? '경사로없음'
        : undefined;

    return [floorTag, slopeTag].filter(tag => tag) as string[];
  })();

  const hasReview = reviewCount > 0;

  const tagsRow = accessibility?.placeAccessibility ? (
    <V2TagsRow>
      {tagTexts.map((text, index) => (
        <React.Fragment key={index}>
          {index > 0 && <V2TagDot />}
          <V2TagText>{text}</V2TagText>
        </React.Fragment>
      ))}
      {hasReview && (
        <>
          {tagTexts.length > 0 && <V2TagDot />}
          <V2ReviewContainer>
            <ReviewOutlineIcon width={16} height={16} color={color.gray60} />
            <V2TagText>
              {'리뷰 '}
              <V2ReviewCount>{reviewCount}</V2ReviewCount>
            </V2TagText>
          </V2ReviewContainer>
        </>
      )}
    </V2TagsRow>
  ) : null;

  return (
    <Container>
      <StairLevelRow>
        <BadgeShell
          backgroundColor={ScoreColorMap[scoreStatus].background}
          textColor={ScoreColorMap[scoreStatus].text}
          borderColor={
            ScoreColorMap[scoreStatus].border ??
            ScoreColorMap[scoreStatus].background
          }>
          <BadgeText
            textColor={ScoreColorMap[scoreStatus].text}
            style={{letterSpacing: -0.24}}>
            {hasScore
              ? `접근레벨 ${accessibilityScore}`
              : isProcessing
                ? '계산중(건물정보 필요)'
                : '접근레벨 -'}
          </BadgeText>
        </BadgeShell>
        {(placeTags?.length ?? 0) > 0 && <PlaceTags tags={placeTags ?? []} />}
      </StairLevelRow>
      <NameContainer onLayout={onNameLayout}>
        <PlaceName>{place.name}</PlaceName>
      </NameContainer>
      {tagsRow}
    </Container>
  );
}

// --- styled components ---

const Container = styled.View`
  padding-left: 20px;
  padding-top: 4px;
`;

const NameContainer = styled.View`
  margin-top: 8px;
  padding-bottom: 6px;
`;

const PlaceName = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 20px;
  line-height: 28px;
  letter-spacing: -0.4px;
  color: ${color.black};
`;

const V2TagsRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
`;

const V2TagDot = styled.View`
  width: 2px;
  height: 2px;
  border-radius: 1px;
  background-color: ${color.gray30};
`;

const V2TagText = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 13px;
  line-height: 18px;
  letter-spacing: -0.26px;
  color: ${color.gray60};
`;

const V2ReviewContainer = styled.View`
  flex-direction: row;
  align-items: flex-end;
  gap: 2px;
`;

const V2ReviewCount = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 13px;
  line-height: 18px;
  letter-spacing: -0.26px;
  color: ${color.brand50};
`;

// 접근레벨 배지 + 저장리스트 태그를 한 줄로 묶어 가로 스크롤.
const StairLevelRow = styled.ScrollView.attrs({
  horizontal: true,
  showsHorizontalScrollIndicator: false,
  contentContainerStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  } as const,
})`
  overflow: hidden;
`;
