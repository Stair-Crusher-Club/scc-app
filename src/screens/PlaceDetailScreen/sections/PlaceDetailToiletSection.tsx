import React from 'react';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {ToiletReviewDto} from '@/generated-sources/openapi';
import useMe from '@/hooks/useMe';
import {LogClick} from '@/logging/LogClick';
import useNavigation from '@/navigation/useNavigation';
import PlaceToiletReviewItem from '@/screens/PlaceDetailScreen/components/PlaceToiletReviewItem';
import {useCheckAuth} from '@/utils/checkAuth';

import * as S from './PlaceDetailEntranceSection.style';

interface Props {
  toiletReviews: ToiletReviewDto[];
  placeId: string;
}

export default function PlaceDetailToiletSection({
  toiletReviews,
  placeId,
}: Props) {
  const navigation = useNavigation();
  const checkAuth = useCheckAuth();
  const {userInfo} = useMe();

  return (
    <S.Section>
      <HeaderRow>
        <S.Title>장애인 화장실 정보</S.Title>
        <LogClick elementName="place_detail_toilet_review_write_button">
          <ReviewButton
            onPress={() =>
              checkAuth(() => {
                navigation.navigate('ReviewForm/Toilet', {
                  placeId,
                });
              })
            }>
            <ReviewButtonText>정보 등록하기</ReviewButtonText>
          </ReviewButton>
        </LogClick>
      </HeaderRow>
      <ItemList>
        {toiletReviews.map((review, idx) => (
          <React.Fragment key={review.id}>
            <PlaceToiletReviewItem
              placeId={placeId}
              review={review}
              isAuthor={userInfo?.id === review.user.id}
            />
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
  background-color: ${color.brand30};
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
