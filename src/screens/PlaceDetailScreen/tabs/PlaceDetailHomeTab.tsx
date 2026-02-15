import React from 'react';
import {View} from 'react-native';
import styled from 'styled-components/native';

import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  AccessibilityInfoDto,
  Place,
  PlaceReviewDto,
} from '@/generated-sources/openapi';

import PlaceFloorInfo from '../components/PlaceFloorInfo';
import PlaceEntranceStepInfo from '../components/PlaceEntranceStepInfo';
import PlaceDoorInfo from '../components/PlaceDoorInfo';
import PlaceReviewItem from '../components/PlaceReviewItem';
import AccessibilitySummarySection from '../sections/AccessibilitySummarySection';

interface Props {
  accessibility?: AccessibilityInfoDto;
  place: Place;
  reviews: PlaceReviewDto[];
  onPressAccessibilityTab: () => void;
  onPressReviewTab: () => void;
}

export default function PlaceDetailHomeTab({
  accessibility,
  place,
  reviews,
  onPressAccessibilityTab,
  onPressReviewTab,
}: Props) {
  const hasAccessibility = !!accessibility?.placeAccessibility;
  const firstReview = reviews.length > 0 ? reviews[0] : null;

  return (
    <Container>
      {/* AI 요약 섹션 */}
      {hasAccessibility && (
        <Section>
          <AccessibilitySummarySection accessibility={accessibility!} />
        </Section>
      )}

      {/* 접근성 요약: 가장 좋은 출입구만 */}
      <Section>
        <SectionHeader>
          <SectionTitle>접근성 정보</SectionTitle>
          {hasAccessibility && (
            <MoreButton
              elementName="place_detail_home_tab_accessibility_more"
              onPress={onPressAccessibilityTab}
              accessibilityLabel="접근성 탭으로 이동">
              <MoreText>더보기</MoreText>
            </MoreButton>
          )}
        </SectionHeader>
        {hasAccessibility ? (
          <AccessibilitySummaryContainer>
            <PlaceFloorInfo accessibility={accessibility} />
            <PlaceEntranceStepInfo accessibility={accessibility} />
            <PlaceDoorInfo accessibility={accessibility} />
          </AccessibilitySummaryContainer>
        ) : (
          <EmptyText>아직 등록된 접근성 정보가 없습니다.</EmptyText>
        )}
      </Section>

      <Divider />

      {/* 리뷰 1건 요약 */}
      <Section>
        <SectionHeader>
          <SectionTitle>방문 리뷰</SectionTitle>
          {reviews.length > 0 && (
            <MoreButton
              elementName="place_detail_home_tab_review_more"
              onPress={onPressReviewTab}
              accessibilityLabel="리뷰 탭으로 이동">
              <MoreText>전체 {reviews.length}건</MoreText>
            </MoreButton>
          )}
        </SectionHeader>
        {firstReview ? (
          <View>
            <PlaceReviewItem placeId={place.id} review={firstReview} />
          </View>
        ) : (
          <EmptyText>아직 등록된 리뷰가 없습니다.</EmptyText>
        )}
      </Section>
    </Container>
  );
}

const Container = styled.View`
  background-color: ${color.white};
  padding-bottom: 100px;
`;

const Section = styled.View`
  padding-vertical: 20px;
  padding-horizontal: 20px;
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
  line-height: 28px;
  color: ${color.gray80};
`;

const MoreButton = styled(SccTouchableOpacity)`
  padding: 4px 0px;
`;

const MoreText = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 14px;
  color: ${color.brand50};
`;

const EmptyText = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 14px;
  color: ${color.gray40};
  text-align: center;
  padding-vertical: 24px;
`;

const AccessibilitySummaryContainer = styled.View`
  gap: 20px;
`;

const Divider = styled.View`
  height: 1px;
  background-color: ${color.gray20};
  margin-horizontal: 20px;
`;
