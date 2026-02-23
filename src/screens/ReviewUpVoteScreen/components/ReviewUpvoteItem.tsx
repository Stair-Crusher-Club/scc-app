import FeedbackButton from '@/components/FeedbackButton';
import SccPressable from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  PlaceReviewListItemDto,
  ToiletReviewListItemDto,
} from '@/generated-sources/openapi/api';
import {usePlaceDetailScreenName} from '@/hooks/useFeatureFlags';
import {useUpvoteToggle} from '@/hooks/useUpvoteToggle';
import useNavigation from '@/navigation/useNavigation';
import styled from 'styled-components/native';

interface ItemProps {
  item: PlaceReviewListItemDto | ToiletReviewListItemDto;
}

export default function ReviewUpvoteItem({item}: ItemProps) {
  const navigation = useNavigation();
  const pdpScreen = usePlaceDetailScreenName();

  const isPlaceReview = 'placeReviewId' in item;
  const targetType = isPlaceReview ? 'PLACE_REVIEW' : 'TOILET_REVIEW';
  const targetId = isPlaceReview ? item.placeReviewId : item.toiletReviewId;

  const {isUpvoted, totalUpvoteCount, toggleUpvote} = useUpvoteToggle({
    initialIsUpvoted: item.isUpvoted,
    initialTotalCount: item.totalUpvoteCount,
    targetId,
    targetType,
    placeId: item.placeId,
  });

  return (
    <Container>
      <PlaceButton
        elementName="navigate_to_place_detail_button"
        onPress={() =>
          navigation.navigate(pdpScreen, {
            placeInfo: {
              placeId: item.placeId,
            },
          })
        }>
        <PlaceName>{item.placeName}</PlaceName>
        <PlaceAddress>{item.placeAddress}</PlaceAddress>
      </PlaceButton>

      <FeedbackButton
        total={totalUpvoteCount}
        isUpvoted={isUpvoted}
        onPressUpvote={toggleUpvote}
        onPressAnalytics={() => {
          navigation.navigate('UpvoteAnalytics', {
            targetType,
            targetId,
          });
        }}
      />
    </Container>
  );
}

const Container = styled.View`
  gap: 16px;
`;

const PlaceButton = styled(SccPressable)`
  gap: 4px;
`;

const PlaceName = styled.Text`
  font-size: 16px;
  font-family: ${font.pretendardBold};
  line-height: 24px;
  color: ${color.gray90};
`;

const PlaceAddress = styled.Text`
  font-size: 13px;
  font-family: ${font.pretendardRegular};
  line-height: 18px;
  color: ${color.gray50};
`;
