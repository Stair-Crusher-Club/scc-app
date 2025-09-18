import React from 'react';
import * as S from '../../ConquererScreen/sections/CrusherHistorySection.style';

import RightAngleArrowIcon from '@/assets/icon/ic_angle_bracket_right.svg';
import {color} from '@/constant/color';
import useAppComponents from '@/hooks/useAppComponents';
import useNavigation from '@/navigation/useNavigation';
import {useQueries} from '@tanstack/react-query';

export default function HistorySection() {
  const {api} = useAppComponents();
  const navigation = useNavigation();

  const [placeReview, toiletReview] = useQueries({
    queries: [
      {
        queryKey: ['ReviewHistory', 'Review', 'Place'],
        queryFn: async () =>
          (await api.listRegisteredPlaceReviewsPost({limit: 1})).data,
      },
      {
        queryKey: ['ReviewHistory', 'Review', 'Toilet'],
        queryFn: async () =>
          (await api.listRegisteredToiletReviewsPost({limit: 1})).data,
      },
    ],
  }).map(r => r.data);
  const [placeUpvote, toiletUpvote] = useQueries({
    queries: [
      {
        queryKey: ['ReviewHistory', 'Upvote', 'Place'],
        queryFn: async () =>
          (await api.listUpvotedPlaceReviewsPost({limit: 1})).data,
      },
      {
        queryKey: ['ReviewHistory', 'Upvote', 'Toilet'],
        queryFn: async () =>
          (await api.listUpvotedToiletReviewsPost({limit: 1})).data,
      },
    ],
  }).map(r => r.data);

  const totalNumberOfReviews =
    (placeReview?.totalNumberOfItems ?? 0) +
    (toiletReview?.totalNumberOfItems ?? 0);

  const totalNumberOfUpvote =
    +(placeUpvote?.totalNumberOfUpvotes ?? 0) +
    (toiletUpvote?.totalNumberOfUpvotes ?? 0);

  return (
    <S.CrusherHistorySection>
      <S.Title>리뷰 히스토리</S.Title>
      <S.Divier />
      <S.Link
        elementName="review_link"
        onPress={() => navigation.navigate('Review/History')}>
        <S.LinkName>
          <S.LinkText>지금까지 내가 작성한 리뷰</S.LinkText>
        </S.LinkName>
        <S.ClickGuide>
          <S.CountBadge>
            <S.Count>{totalNumberOfReviews.toLocaleString()}</S.Count>
          </S.CountBadge>
          <RightAngleArrowIcon color={color.gray50} />
        </S.ClickGuide>
      </S.Link>
      <S.Link
        elementName="review_upvote_link"
        onPress={() => navigation.navigate('Review/Upvote')}>
        <S.LinkName>
          <S.LinkText>도움이 되었어요</S.LinkText>
        </S.LinkName>
        <S.ClickGuide>
          <S.CountBadge>
            <S.Count>{totalNumberOfUpvote.toLocaleString()}</S.Count>
          </S.CountBadge>
          <RightAngleArrowIcon color={color.gray50} />
        </S.ClickGuide>
      </S.Link>
    </S.CrusherHistorySection>
  );
}
