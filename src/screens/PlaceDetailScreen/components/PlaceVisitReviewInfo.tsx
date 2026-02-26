import React, {useState} from 'react';
import styled from 'styled-components/native';

import AngleBracketDownIcon from '@/assets/icon/ic_angle_bracket_down.svg';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {RECOMMEND_MOBILITY_TOOL_LABELS} from '@/constant/review';
import {
  PlaceReviewDto,
  RecommendedMobilityTypeDto,
} from '@/generated-sources/openapi';
import PlaceDetailPlaceReviewItem from '@/screens/PlaceDetailScreen/components/PlaceReviewItem';

import PlaceVisitReviewFilterModal from '../modals/PlaceVisitReviewFilterModal';

interface Props {
  reviews: PlaceReviewDto[];
  placeId: string;
}

const MOBILITY_LABEL_MAP: Record<RecommendedMobilityTypeDto, string> = {
  ...RECOMMEND_MOBILITY_TOOL_LABELS,
};

export default function PlaceVisitReviewInfo({reviews, placeId}: Props) {
  const [selectedMobilityType, setSelectedMobilityType] =
    useState<RecommendedMobilityTypeDto | null>(null);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  const filteredReviews = selectedMobilityType
    ? reviews.filter(r =>
        r.recommendedMobilityTypes?.includes(selectedMobilityType),
      )
    : reviews;

  const filterChipLabel = selectedMobilityType
    ? MOBILITY_LABEL_MAP[selectedMobilityType]
    : '모든 이동 유형';

  return (
    <>
      <ChipList>
        <ChipContainer isActive={false}>
          <ChipText isActive={false}>최신순</ChipText>
        </ChipContainer>
        <SccTouchableOpacity
          elementName="place_visit_review_filter_chip"
          logParams={{chipText: filterChipLabel}}
          activeOpacity={0.7}
          onPress={() => setIsFilterModalVisible(true)}>
          <FilterChipInner isActive={selectedMobilityType !== null}>
            <ChipText isActive={selectedMobilityType !== null}>
              {filterChipLabel}
            </ChipText>
            <AngleBracketDownIcon
              width={16}
              height={16}
              color={
                selectedMobilityType !== null ? color.brand50 : color.gray100
              }
            />
          </FilterChipInner>
        </SccTouchableOpacity>
      </ChipList>
      <ItemList>
        {filteredReviews.map((review, idx) => (
          <React.Fragment key={review.id}>
            <PlaceDetailPlaceReviewItem placeId={placeId} review={review} />
            {idx !== filteredReviews.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </ItemList>
      <PlaceVisitReviewFilterModal
        isVisible={isFilterModalVisible}
        selected={selectedMobilityType}
        onSelect={setSelectedMobilityType}
        onClose={() => setIsFilterModalVisible(false)}
      />
    </>
  );
}

const ChipList = styled.View`
  flex-direction: row;
  gap: 8px;
`;

const ChipContainer = styled.View<{isActive: boolean}>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: ${({isActive}) => (isActive ? color.brand5 : color.white)};
  padding-vertical: 6px;
  padding-horizontal: 12px;
  border-radius: 56px;
  gap: 3px;
  border-width: 1px;
  border-color: ${({isActive}) => (isActive ? color.brand : color.gray20)};
`;

const FilterChipInner = styled.View<{isActive: boolean}>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: ${({isActive}) => (isActive ? color.brand5 : color.white)};
  padding-vertical: 6px;
  padding-horizontal: 12px;
  border-radius: 56px;
  gap: 3px;
  border-width: 1px;
  border-color: ${({isActive}) => (isActive ? color.brand : color.gray20)};
`;

const ChipText = styled.Text<{isActive: boolean}>`
  font-size: 13px;
  font-family: ${() => font.pretendardMedium};
  color: ${({isActive}) => (isActive ? color.brand50 : color.gray100)};
`;

const ItemList = styled.View`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Divider = styled.View`
  height: 1px;
  background-color: ${color.gray20};
`;
