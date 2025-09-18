import FeedbackButton from '@/components/FeedbackButton';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  PlaceReviewListItemDto,
  ToiletReviewListItemDto,
} from '@/generated-sources/openapi/api';
import {useUpvoteToggle} from '@/hooks/useUpvoteToggle';
import useNavigation from '@/navigation/useNavigation';
import {UpdateUpvoteStatusParams} from '@/screens/PlaceDetailScreen/types';
import {Pressable, Text, View} from 'react-native';

interface ItemProps {
  item: PlaceReviewListItemDto | ToiletReviewListItemDto;
  updateUpvoteStatus?: (params: UpdateUpvoteStatusParams) => Promise<boolean>;
}

export default function Item({item, updateUpvoteStatus}: ItemProps) {
  const navigation = useNavigation();

  const isPlaceReview = 'placeReviewId' in item;
  const targetType = isPlaceReview ? 'PLACE_REVIEW' : 'TOILET_REVIEW';
  const targetId = isPlaceReview ? item.placeReviewId : item.toiletReviewId;

  const {isUpvoted, totalUpvoteCount, toggleUpvote} = useUpvoteToggle({
    initialIsUpvoted: item.isUpvoted,
    initialTotalCount: item.totalUpvoteCount,
    targetId,
    targetType,
    updateUpvoteStatus,
  });

  return (
    <View style={{gap: 16}}>
      <Pressable
        onPress={() =>
          navigation.navigate('PlaceDetail', {
            placeInfo: {
              placeId: item.placeId,
            },
          })
        }
        style={{
          gap: 4,
        }}>
        <Text
          style={{
            fontSize: 16,
            fontFamily: font.pretendardBold,
            lineHeight: 24,
            color: color.gray90,
          }}>
          {item.placeName}
        </Text>
        <Text
          style={{
            fontSize: 13,
            fontFamily: font.pretendardRegular,
            lineHeight: 18,
            color: color.gray50,
          }}>
          {item.placeAddress}
        </Text>
      </Pressable>

      <FeedbackButton
        total={totalUpvoteCount}
        upvoted={isUpvoted}
        onPressUpvote={toggleUpvote}
      />
    </View>
  );
}
