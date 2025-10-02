import FeedbackButton from '@/components/FeedbackButton';
import SccPressable from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {UpvotedPlaceDto} from '@/generated-sources/openapi/api';
import {useUpvoteToggle} from '@/hooks/useUpvoteToggle';
import useNavigation from '@/navigation/useNavigation';
import {Text, View} from 'react-native';

interface ItemProps {
  item: UpvotedPlaceDto;
}

export default function Item({item}: ItemProps) {
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
    <View style={{gap: 16}}>
      <SccPressable
        elementName="navigate_to_place_detail_button"
        onPress={() =>
          navigation.navigate('PlaceDetail', {
            placeInfo: {
              placeId: item.id!!,
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
          {item.name}
        </Text>
        <Text
          style={{
            fontSize: 13,
            fontFamily: font.pretendardRegular,
            lineHeight: 18,
            color: color.gray50,
          }}>
          {item.address}
        </Text>
      </SccPressable>

      <FeedbackButton
        total={totalUpvoteCount}
        upvoted={isUpvoted}
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
