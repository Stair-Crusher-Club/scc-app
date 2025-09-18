import dayjs from 'dayjs';
import React, {useState} from 'react';
import {Alert} from 'react-native';
import styled from 'styled-components/native';

import FeedbackButton from '@/components/FeedbackButton';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';

import MoreIcon from '@/assets/icon/ic_more.svg';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  RECOMMEND_MOBILITY_TOOL_LABELS,
  SPACIOUS_LABELS,
} from '@/constant/review';
import {PlaceReviewListItemDto} from '@/generated-sources/openapi';
import {useUpvoteToggle} from '@/hooks/useUpvoteToggle';
import ImageList from '@/screens/PlaceDetailScreen/components/PlaceDetailImageList';
import {UpdateUpvoteStatusParams} from '@/screens/PlaceDetailScreen/types';
import ToastUtils from '@/utils/ToastUtils';

import useNavigation from '@/navigation/useNavigation';
import {useDeleteReview} from '../../PlaceDetailScreen/hooks/useDeleteReview';
import DeleteBottomSheet from '../../PlaceDetailScreen/modals/DeleteBottomSheet';

export default function PlaceReviewItem({
  placeId,
  review,
  updateUpvoteStatus,
}: {
  placeId: string;
  review: PlaceReviewListItemDto;
  updateUpvoteStatus?: (params: UpdateUpvoteStatusParams) => Promise<boolean>;
}) {
  const navigation = useNavigation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const deletePlaceReview = useDeleteReview({
    type: 'place',
    reviewId: review.placeReviewId,
    placeId,
  });

  const {isUpvoted, totalUpvoteCount, toggleUpvote} = useUpvoteToggle({
    initialIsUpvoted: review.isUpvoted,
    initialTotalCount: review.totalUpvoteCount,
    targetId: review.placeReviewId,
    targetType: 'PLACE_REVIEW',
    updateUpvoteStatus,
  });

  const reviewText = review.comment;
  const reviewDate = dayjs(review.createdAt.value).format('YYYY.MM.DD');

  return (
    <Container
      onPress={() =>
        navigation.navigate('PlaceDetail', {
          placeInfo: {
            placeId: review.placeId,
          },
        })
      }>
      <HeaderRow>
        <HeaderLeft>
          <PlaceName>{review.placeName}</PlaceName>
          <PlaceAddress>{review.placeAddress}</PlaceAddress>
        </HeaderLeft>
        {review.isDeletable && (
          <SccTouchableOpacity
            elementName="place_review_more_button"
            onPress={() =>
              Alert.alert(
                '더보기',
                '',
                [
                  {
                    text: '삭제',
                    onPress: () => setIsDeleteModalVisible(true),
                    style: 'destructive',
                  },
                  {
                    text: '수정',
                    onPress: () => ToastUtils.show('준비중입니다.'),
                  },
                  {text: '취소', style: 'cancel'},
                ],
                {cancelable: true},
              )
            }>
            <MoreIcon />
          </SccTouchableOpacity>
        )}
      </HeaderRow>
      {review.images && review.images.length > 0 && (
        <ImageList images={review.images} roundCorners />
      )}
      <ReviewContentColumn>
        <ReviewInfoColumn>
          <ReviewInfoRow>
            <ReviewInfoLabel>등록일</ReviewInfoLabel>
            <ReviewInfoValue>{reviewDate}</ReviewInfoValue>
          </ReviewInfoRow>
          <ReviewInfoRow>
            <ReviewInfoLabel>추천대상</ReviewInfoLabel>
            <ReviewInfoValue>
              {review.recommendedMobilityTypes
                ?.map(type => RECOMMEND_MOBILITY_TOOL_LABELS[type])
                .join(', ')}
            </ReviewInfoValue>
          </ReviewInfoRow>
          <ReviewInfoRow>
            <ReviewInfoLabel>내부공간</ReviewInfoLabel>
            <ReviewInfoValue>
              {SPACIOUS_LABELS[review.spaciousType]}
            </ReviewInfoValue>
          </ReviewInfoRow>
        </ReviewInfoColumn>
        {reviewText && (
          <>
            <ReviewText numberOfLines={isExpanded ? undefined : 2}>
              {reviewText}
            </ReviewText>
            {reviewText.length > 50 && ( // TODO 정확히 2줄 넘으면 안보이게 하기
              <ExpandButton
                elementName="place_review_expand_button"
                onPress={() => setIsExpanded(value => !value)}>
                <ExpandButtonText>
                  {isExpanded ? '접기' : '더보기'}
                </ExpandButtonText>
              </ExpandButton>
            )}
          </>
        )}
      </ReviewContentColumn>

      <FeedbackButton
        upvoted={isUpvoted}
        total={totalUpvoteCount}
        onPressUpvote={toggleUpvote}
      />

      <DeleteBottomSheet
        isVisible={isDeleteModalVisible}
        confirmText={'리뷰를 정말 삭제할까요?'}
        onPressCancelButton={() => setIsDeleteModalVisible(false)}
        onPressConfirmButton={() => {
          setIsDeleteModalVisible(false);
          deletePlaceReview.mutate();
        }}
      />
    </Container>
  );
}

// styled-components
const Container = styled.Pressable`
  gap: 16px;
  flex-direction: column;
`;
const HeaderRow = styled.View`
  flex-direction: row;
  gap: 4px;
  align-items: flex-start;
  justify-content: space-between;
`;
const HeaderLeft = styled.View`
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;
const PlaceName = styled.Text`
  font-size: 16px;
  line-height: 24px;
  font-family: ${font.pretendardBold};
  color: ${color.gray90};
`;
const PlaceAddress = styled.Text`
  font-size: 13px;
  line-height: 18px;
  font-family: ${font.pretendardRegular};
  color: ${color.gray50};
`;
const ReviewContentColumn = styled.View`
  flex-direction: column;
  gap: 8px;
`;
const ReviewInfoColumn = styled.View`
  flex-direction: column;
  gap: 2px;
  align-items: flex-start;
`;
const ReviewInfoRow = styled.View`
  flex-direction: row;
  gap: 8px;
  align-items: center;
`;
const ReviewInfoLabel = styled.Text`
  font-size: 12px;
  line-height: 16px;
  font-family: ${font.pretendardRegular};
  width: 46px;
  color: ${color.gray40};
`;
const ReviewInfoValue = styled.Text`
  font-size: 14px;
  line-height: 22px;
  font-family: ${font.pretendardRegular};
  color: ${color.gray70};
`;
const ReviewText = styled.Text`
  font-size: 15px;
  line-height: 22px;
  font-family: ${font.pretendardRegular};
  color: ${color.gray70};
`;
const ExpandButton = styled(SccTouchableOpacity)`
  flex-direction: row;
  gap: 8px;
  justify-content: flex-end;
`;
const ExpandButtonText = styled.Text`
  font-size: 13px;
  line-height: 18px;
  font-family: ${font.pretendardRegular};
  color: ${color.gray40};
`;
