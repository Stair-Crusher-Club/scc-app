import {View, Text} from 'react-native';

import FeedbackButton from '@/components/FeedbackButton';
import SccPressable from '@/components/SccPressable';
import {UpvotedPlaceDto} from '@/generated-sources/openapi/api';
import {useUpvoteToggle} from '@/hooks/useUpvoteToggle';
import useNavigation from '@/navigation/useNavigation';

interface ItemProps {
  item: UpvotedPlaceDto;
}

export default function UpvotedPlaceItem({item}: ItemProps) {
  const navigation = useNavigation();

  const targetType = item.accessibilityType!!;
  const targetId = item.accessibilityId!!;

  const {isUpvoted, totalUpvoteCount, toggleUpvote} = useUpvoteToggle({
    initialIsUpvoted: item.isUpvoted,
    initialTotalCount: item.totalUpvoteCount,
    targetId,
    targetType,
    placeId: item.id!!,
  });

  return (
    <View className="gap-4">
      <SccPressable
        elementName="navigate_to_place_detail_button"
        onPress={() =>
          navigation.navigate('PlaceDetail', {
            placeInfo: {
              placeId: item.id!!,
            },
          })
        }
        className="gap-1">
        <Text className="text-[16px] font-pretendard-bold leading-[24px] text-gray-90">
          {item.name}
        </Text>
        <Text className="text-[13px] font-pretendard-regular leading-[18px] text-gray-50">
          {item.address}
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
