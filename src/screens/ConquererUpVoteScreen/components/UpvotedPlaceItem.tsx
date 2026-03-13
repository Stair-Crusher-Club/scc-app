import FeedbackButton from '@/components/FeedbackButton';
import SccPressable from '@/components/SccPressable';
import {UpvotedPlaceDto} from '@/generated-sources/openapi/api';
import {usePlaceDetailScreenName} from '@/hooks/useFeatureFlags';
import useNavigation from '@/navigation/useNavigation';
import {Text, View} from 'react-native';

interface ItemProps {
  item: UpvotedPlaceDto;
}

export default function UpvotedPlaceItem({item}: ItemProps) {
  const navigation = useNavigation();
  const pdpScreen = usePlaceDetailScreenName();

  const targetType = item.accessibilityType!!;
  const targetId = item.accessibilityId!!;

  return (
    <View className="gap-4">
      <SccPressable
        className="gap-1"
        elementName="navigate_to_place_detail_button"
        onPress={() =>
          navigation.navigate(pdpScreen, {
            placeInfo: {
              placeId: item.id!!,
            },
          })
        }>
        <Text className="text-[16px] font-pretendard-bold leading-[24px] text-gray-90">{item.name}</Text>
        <Text className="text-[13px] font-pretendard-regular leading-[18px] text-gray-50">{item.address}</Text>
      </SccPressable>

      <FeedbackButton
        total={item.totalUpvoteCount}
        isUpvoted={item.isUpvoted}
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
