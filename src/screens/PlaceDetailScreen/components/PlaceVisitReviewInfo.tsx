import React, {useMemo, useState} from 'react';
import styled from 'styled-components/native';

import DownIcon from '@/assets/icon/ic_angle_bracket_down.svg';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  PlaceReviewDto,
  RecommendedMobilityTypeDto,
} from '@/generated-sources/openapi';
import PlaceReviewItem from '@/screens/PlaceDetailScreen/components/PlaceReviewItem';
import {MOBILITY_TYPE_LABELS} from '@/screens/PlaceDetailScreen/constants/labels';

interface Props {
  reviews: PlaceReviewDto[];
}

export default function PlaceVisitReviewInfo({reviews}: Props) {
  // eslint-disable-next-line
  const [sortType, setSortType] = useState<'latest' | 'oldest'>('latest');
  // eslint-disable-next-line
  const [targetMobilityType, setTargetMobilityType] =
    useState<RecommendedMobilityTypeDto | null>(null);
  const sortedReviews = useMemo(() => {
    if (targetMobilityType) {
      return reviews.filter(review =>
        review.recommendedMobilityTypes.includes(targetMobilityType),
      );
    }
    return reviews;
  }, [reviews, sortType]);
  return (
    <>
      <ChipList>
        <Chip isActive={false} onPress={() => {}}>
          <ChipText isActive={false}>최신순</ChipText>
          <DownIcon width={12} height={12} color={color.black} />
        </Chip>
        <Chip isActive={false} onPress={() => {}}>
          <ChipText isActive={false}>
            {targetMobilityType
              ? MOBILITY_TYPE_LABELS[targetMobilityType]
              : '추천대상'}
          </ChipText>
          <DownIcon width={12} height={12} color={color.black} />
        </Chip>
      </ChipList>
      {sortedReviews.map(review => (
        <PlaceReviewItem key={review.id} review={review} />
      ))}
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
  background-color: ${({isActive}) => (isActive ? color.gray90 : color.white)};
  padding-vertical: 6px;
  padding-horizontal: 12px;
  border-radius: 56px;
  gap: 3px;
  border-width: 1px;
  border-color: ${color.gray20};
`;

const ChipText = styled.Text<{isActive: boolean}>`
  font-size: 13px;
  font-family: ${() => font.pretendardMedium};
  color: ${({isActive}) => (isActive ? color.white : color.gray100)};
`;
