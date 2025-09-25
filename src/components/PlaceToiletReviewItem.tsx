import dayjs from 'dayjs';
import React, {useState} from 'react';
import {Alert, View} from 'react-native';
import styled from 'styled-components/native';

import FeedbackButton from '@/components/FeedbackButton';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';

import BadgedIcon from '@/assets/icon/ic_badged_crew.svg';
import MoreIcon from '@/assets/icon/ic_more.svg';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {doorTypeMap} from '@/constant/options';
import {TOILET_LOCATION_TYPE_LABELS} from '@/constant/review';
import {
  ToiletReviewDto,
  ToiletReviewListItemDto,
} from '@/generated-sources/openapi';
import {useUpvoteToggle} from '@/hooks/useUpvoteToggle';
import ImageList from '@/screens/PlaceDetailScreen/components/PlaceDetailImageList';
import ToastUtils from '@/utils/ToastUtils';

import useNavigation from '@/navigation/useNavigation';
import UserMobilityLabel from '@/screens/PlaceDetailScreen/components/UserMobilityLabel';
import {useDeleteReview} from '@/screens/PlaceDetailScreen/hooks/useDeleteReview';
import DeleteBottomSheet from '@/screens/PlaceDetailScreen/modals/DeleteBottomSheet';

type ReviewVariant = 'detail' | 'history';

interface PlaceToiletReviewItemProps {
  placeId: string;
  review: ToiletReviewDto | ToiletReviewListItemDto;
  variant?: ReviewVariant;
}

export default function PlaceToiletReviewItem({
  placeId,
  review,
  variant = 'detail',
}: PlaceToiletReviewItemProps) {
  const navigation = useNavigation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const isDetailReview = variant === 'detail';
  const isHistoryReview = variant === 'history';

  const deleteToiletReview = useDeleteReview({
    type: 'toilet',
    reviewId: isDetailReview
      ? (review as ToiletReviewDto).id
      : (review as ToiletReviewListItemDto).toiletReviewId,
    placeId,
  });

  const {isUpvoted, totalUpvoteCount, toggleUpvote} = useUpvoteToggle({
    initialIsUpvoted: review.isUpvoted,
    initialTotalCount: review.totalUpvoteCount,
    targetId: isDetailReview
      ? (review as ToiletReviewDto).id
      : (review as ToiletReviewListItemDto).toiletReviewId,
    targetType: 'TOILET_REVIEW',
  });

  const reviewImages = review.images;
  const reviewText = review.comment;
  const reviewDate = dayjs(review.createdAt.value).format('YYYY.MM.DD');

  const handleContainerPress = () => {
    if (variant === 'history' && isHistoryReview) {
      navigation.navigate('PlaceDetail', {
        placeInfo: {
          placeId: (review as ToiletReviewListItemDto).placeId,
        },
      });
    }
  };

  const renderHeader = () => {
    if (variant === 'detail' && isDetailReview) {
      return (
        <HeaderLeft variant={variant}>
          <ReviewerName>{review.user?.nickname || '익명'}</ReviewerName>
          {review.user?.isClubMember && <BadgedIcon />}
          {review.user?.isClubMember &&
            (review as ToiletReviewDto).mobilityTool !== 'NONE' && (
              <ReviewDate>·</ReviewDate>
            )}
          {(review as ToiletReviewDto).mobilityTool !== 'NONE' && (
            <UserMobilityLabel
              mobilityTool={(review as ToiletReviewDto).mobilityTool}
            />
          )}
        </HeaderLeft>
      );
    }

    if (variant === 'history' && isHistoryReview) {
      return (
        <HeaderLeft variant={variant}>
          <PlaceName>{(review as ToiletReviewListItemDto).placeName}</PlaceName>
          <PlaceAddress>
            {(review as ToiletReviewListItemDto).placeAddress}
          </PlaceAddress>
        </HeaderLeft>
      );
    }

    return null;
  };

  return (
    <Container
      as={variant === 'history' ? PressableContainer : ViewContainer}
      onPress={variant === 'history' ? handleContainerPress : undefined}>
      <HeaderRow variant={variant}>
        {renderHeader()}
        {review.isDeletable && (
          <SccTouchableOpacity
            elementName="place_toilet_review_more_button"
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
      <ReviewContentColumn style={{width: '100%'}}>
        <View
          style={{
            flexDirection: 'row',
            gap: 12,
            width: '100%',
            justifyContent: 'space-between',
          }}>
          <ReviewInfoColumn>
            <ReviewInfoRow>
              <ReviewInfoLabel>등록일</ReviewInfoLabel>
              <ReviewInfoValue>{reviewDate}</ReviewInfoValue>
            </ReviewInfoRow>
            <ReviewInfoRow>
              <ReviewInfoLabel>위치</ReviewInfoLabel>
              <ReviewInfoValue>
                {TOILET_LOCATION_TYPE_LABELS[review.toiletLocationType]}
              </ReviewInfoValue>
            </ReviewInfoRow>
            {review.floor && (
              <ReviewInfoRow>
                <ReviewInfoLabel>층</ReviewInfoLabel>
                <ReviewInfoValue>{review.floor}</ReviewInfoValue>
              </ReviewInfoRow>
            )}

            {review.entranceDoorTypes &&
              review.entranceDoorTypes?.length > 0 && (
                <ReviewInfoRow>
                  <ReviewInfoLabel>문유형</ReviewInfoLabel>
                  <ReviewInfoValue>
                    {review.entranceDoorTypes
                      ?.map(type => doorTypeMap[type])
                      .join(', ')}
                  </ReviewInfoValue>
                </ReviewInfoRow>
              )}
          </ReviewInfoColumn>
          {reviewImages && reviewImages.length > 0 && (
            <ImageList
              images={reviewImages || []}
              roundCorners
              isSinglePreview
            />
          )}
        </View>
        {reviewText && (
          <>
            <ReviewText numberOfLines={isExpanded ? undefined : 2}>
              {reviewText}
            </ReviewText>
            {reviewText.length > 50 && ( // TODO 정확히 2줄 넘으면 안보이게 하기
              <ExpandButton
                elementName="toilet_review_expand_button"
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
        onPressAnalytics={() =>
          navigation.navigate('UpvoteAnalytics', {
            targetType: 'TOILET_REVIEW',
            targetId: isDetailReview
              ? (review as ToiletReviewDto).id
              : (review as ToiletReviewListItemDto).toiletReviewId,
          })
        }
      />

      <DeleteBottomSheet
        isVisible={isDeleteModalVisible}
        confirmText={'화장실 리뷰를 정말 삭제할까요?'}
        onPressCancelButton={() => setIsDeleteModalVisible(false)}
        onPressConfirmButton={() => {
          setIsDeleteModalVisible(false);
          deleteToiletReview.mutate();
        }}
      />
    </Container>
  );
}

// styled-components
const Container = styled.View`
  gap: 16px;
  flex-direction: column;
`;

const PressableContainer = styled(SccTouchableOpacity)`
  gap: 16px;
  flex-direction: column;
`;

const ViewContainer = styled.View`
  gap: 16px;
  flex-direction: column;
`;

const HeaderRow = styled.View<{variant?: ReviewVariant}>`
  flex-direction: row;
  gap: 4px;
  align-items: ${props =>
    props.variant === 'history' ? 'flex-start' : 'center'};
  justify-content: space-between;
`;

const HeaderLeft = styled.View<{variant?: ReviewVariant}>`
  flex-direction: ${props => (props.variant === 'history' ? 'column' : 'row')};
  gap: 4px;
  align-items: ${props =>
    props.variant === 'history' ? 'flex-start' : 'center'};
  flex: ${props => (props.variant === 'history' ? '1' : 'none')};
`;

const ReviewerName = styled.Text`
  font-size: 15px;
  line-height: 22px;
  font-family: ${font.pretendardBold};
  color: ${color.gray100};
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

const ReviewDate = styled.Text`
  font-size: 11px;
  line-height: 14px;
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
  width: 42px;
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
