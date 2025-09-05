import React from 'react';
import styled from 'styled-components/native';

import DownIcon from '@/assets/icon/ic_angle_bracket_down.svg';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {PlaceReviewDto} from '@/generated-sources/openapi';
import PlaceReviewItem from '@/screens/PlaceDetailScreen/components/PlaceReviewItem';
import ToastUtils from '@/utils/ToastUtils';

interface Props {
  reviews: PlaceReviewDto[];
  placeId: string;
}

export default function PlaceVisitReviewInfo({reviews, placeId}: Props) {
  return (
    <>
      <ChipList>
        <Chip
          isActive={false}
          chipText="최신순"
          onPress={() => {
            ToastUtils.show('준비중입니다.');
          }}>
          <ChipText isActive={false}>최신순</ChipText>
          <DownIcon width={12} height={12} color={color.black} />
        </Chip>
      </ChipList>
      <ItemList>
        {reviews.map((review, idx) => (
          <React.Fragment key={review.id}>
            <PlaceReviewItem placeId={placeId} review={review} />
            {idx !== reviews.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </ItemList>
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
  chipText,
  onPress,
}: React.PropsWithChildren<{
  chipText: string;
  isActive: boolean;
  onPress?: () => void;
}>) {
  return (
    <ChipContainer
      elementName="place_visit_review_filter_chip"
      logParams={{chip_text: chipText}}
      activeOpacity={0.7}
      onPress={onPress}
      isActive={isActive}>
      {children}
    </ChipContainer>
  );
}

const ChipContainer = styled(SccTouchableOpacity)<{isActive: boolean}>`
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
