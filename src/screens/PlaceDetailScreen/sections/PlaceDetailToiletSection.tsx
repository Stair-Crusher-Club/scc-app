import React from 'react';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {ToiletReviewDto} from '@/generated-sources/openapi';
import PlaceToiletInfo from '@/screens/PlaceDetailScreen/components/PlaceToiletInfo';
import PlaceToiletReviewItem from '@/screens/PlaceDetailScreen/components/PlaceToiletReviewItem';

import ImageList from '../components/PlaceDetailImageList';
import * as S from './PlaceDetailEntranceSection.style';

interface Props {
  toiletReviews: ToiletReviewDto[];
}

export default function PlaceDetailToiletSection({toiletReviews}: Props) {
  return (
    <S.Section>
      <HeaderRow>
        <S.Title>장애인 화장실 정보</S.Title>
        <ReviewButton>
          <ReviewButtonText>리뷰 작성하기</ReviewButtonText>
          {/* TODO 리뷰 작성하기 버튼 연결 */}
        </ReviewButton>
      </HeaderRow>
      <ItemList>
        {toiletReviews.map((review, idx) => (
          <React.Fragment key={review.id}>
            <PlaceToiletReviewItem review={review} />
            {idx !== toiletReviews.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </ItemList>
    </S.Section>
  );
}

const ItemList = styled.View`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const HeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
`;

const Divider = styled.View`
  height: 1px;
  background-color: ${color.gray20};
`;

const ReviewButton = styled.TouchableOpacity`
  background-color: ${color.brand50};
  padding-horizontal: 14px;
  height: 31px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
`;

const ReviewButtonText = styled.Text`
  color: ${color.white};
  font-size: 13px;
  line-height: 18px;
  font-family: ${font.pretendardBold};
`;
