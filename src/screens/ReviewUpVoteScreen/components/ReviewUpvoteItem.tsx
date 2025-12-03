import {View, Text} from 'react-native';

import FeedbackButton from '@/components/FeedbackButton';
import SccPressable from '@/components/SccPressable';
import {
  PlaceReviewListItemDto,
  ToiletReviewListItemDto,
} from '@/generated-sources/openapi/api';
import {useUpvoteToggle} from '@/hooks/useUpvoteToggle';
import useNavigation from '@/navigation/useNavigation';

interface ItemProps {
  item: PlaceReviewListItemDto | ToiletReviewListItemDto;
}

export default function ReviewUpvoteItem({item}: ItemProps) {
  const navigation = useNavigation();

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
    <View className="gap-4">
      <SccPressable
        elementName="navigate_to_place_detail_button"
        onPress={() =>
          navigation.navigate('PlaceDetail', {
            placeInfo: {
              placeId: item.placeId,
            },
          })
        }
        className="gap-1">
        <Text className="text-[16px] font-pretendard-bold leading-[24px] text-gray-90">
          {item.placeName}
        </Text>
        <Text className="text-[13px] font-pretendard leading-[18px] text-gray-50">
          {item.placeAddress}
        </Text>
      </SccPressable>

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
    </View>
  );
}
