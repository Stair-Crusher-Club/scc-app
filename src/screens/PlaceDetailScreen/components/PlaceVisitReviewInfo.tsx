import React, {useMemo, useState} from 'react';
import styled from 'styled-components/native';

import DownIcon from '@/assets/icon/ic_angle_bracket_down.svg';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {RECOMMEND_MOBILITY_TOOL_LABELS} from '@/constant/review';
import {
  PlaceReviewDto,
  RecommendedMobilityTypeDto,
} from '@/generated-sources/openapi';
import PlaceReviewItem from '@/screens/PlaceDetailScreen/components/PlaceReviewItem';
import ToastUtils from '@/utils/ToastUtils';

import PlaceVisitReviewFilterModal from '../modals/PlaceVisitReviewFilterModal';

interface Props {
  reviews: PlaceReviewDto[];
}

export default function PlaceVisitReviewInfo({reviews}: Props) {
  const [targetMobilityType, setTargetMobilityType] =
    useState<RecommendedMobilityTypeDto | null>(null);
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const sortedReviews = useMemo(() => {
    if (targetMobilityType) {
      return reviews.filter(review =>
        review.recommendedMobilityTypes.includes(targetMobilityType),
      );
    }
    return reviews;
  }, [reviews, targetMobilityType]);
  return (
    <>
      <ChipList>
        <Chip
          isActive={false}
          onPress={() => {
            ToastUtils.show('준비중입니다.');
          }}>
          <ChipText isActive={false}>최신순</ChipText>
          <DownIcon width={12} height={12} color={color.black} />
        </Chip>
        <Chip
          isActive={!!targetMobilityType}
          onPress={() => setFilterModalVisible(true)}>
          <ChipText isActive={!!targetMobilityType}>
            {targetMobilityType
              ? RECOMMEND_MOBILITY_TOOL_LABELS[targetMobilityType]
              : '추천대상'}
          </ChipText>
          <DownIcon width={12} height={12} color={color.black} />
        </Chip>
      </ChipList>
      <ItemList>
        {sortedReviews.map((review, idx) => (
          <React.Fragment key={review.id}>
            <PlaceReviewItem review={review} />
            {idx !== sortedReviews.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </ItemList>
      <PlaceVisitReviewFilterModal
        isVisible={isFilterModalVisible}
        selected={targetMobilityType}
        onSelect={setTargetMobilityType}
        onClose={() => setFilterModalVisible(false)}
      />
    </>
  );
}

const ChipList = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
`;

function Chip({
  children,
  isActive,
  onPress,
}: React.PropsWithChildren<{
  isActive: boolean;
  onPress?: () => void;
}>) {
  return (
    <ChipContainer activeOpacity={0.7} onPress={onPress} isActive={isActive}>
      {children}
    </ChipContainer>
  );
}

const ChipContainer = styled.TouchableOpacity<{isActive: boolean}>`
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
