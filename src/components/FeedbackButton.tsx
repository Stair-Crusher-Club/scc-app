import ChevronRightIcon from '@/assets/icon/ic_chevron_right.svg';
import ThumbsUpIcon from '@/assets/icon/ic_thumbs_up.svg';
import ThumbsUpFillIcon from '@/assets/icon/ic_thumbs_up_fill.svg';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {Image, Platform, Text, View} from 'react-native';
import Toast from 'react-native-root-toast';
import SccTouchableOpacity from './SccTouchableOpacity';

interface FeedbackButtonProps {
  total?: number;
  isUpvoted?: boolean;
  onPressUpvote?: () => void;
  onPressInfoUpdateRequest?: () => void; // 정보수정 요청 버튼
  onPressAnalytics?: () => void;
}

export default function FeedbackButton({
  total,
  isUpvoted,
  onPressUpvote,
  onPressInfoUpdateRequest,
  onPressAnalytics,
}: FeedbackButtonProps) {
  return (
    <View
      style={{
        height: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
      <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
        <SccTouchableOpacity
          elementName="place_detail_upvote_button"
          onPress={() => {
            if (Platform.OS === 'web') {
              Toast.show('준비 중입니다 💪', {
                duration: Toast.durations.SHORT,
                position: Toast.positions.BOTTOM,
              });
              return;
            }
            onPressUpvote?.();
          }}
          style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
          {isUpvoted ? <ThumbsUpFillIcon /> : <ThumbsUpIcon />}
          <Text
            style={{
              fontFamily: font.pretendardMedium,
              fontSize: 13,
              lineHeight: 18,
              color: isUpvoted ? color.gray80 : color.gray50,
            }}>
            도움돼요
          </Text>
          {(total ?? 0) > 0 && (
            <View style={{gap: 10, flexDirection: 'row', alignItems: 'center'}}>
              <Text
                style={{
                  fontFamily: font.pretendardMedium,
                  fontSize: 13,
                  lineHeight: 18,
                  color: isUpvoted ? color.gray80 : color.gray50,
                }}>
                {total}
              </Text>
              <View
                style={{
                  width: 1,
                  height: 16,
                  backgroundColor: color.gray20,
                }}
              />
            </View>
          )}
        </SccTouchableOpacity>
        {(total ?? 0) > 0 && (
          <SccTouchableOpacity
            elementName="navigate_to_upvote_analytics_button"
            onPress={() => {
              if (Platform.OS === 'web') {
                Toast.show('준비 중입니다 💪', {
                  duration: Toast.durations.SHORT,
                  position: Toast.positions.BOTTOM,
                });
                return;
              }

              onPressAnalytics?.();
            }}
            style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
            <Image
              source={require('@/assets/img/img_profile.png')}
              style={{
                width: 24,
                height: 24,
              }}
            />
            <ChevronRightIcon />
          </SccTouchableOpacity>
        )}
      </View>

      {onPressInfoUpdateRequest && (
        <SccTouchableOpacity
          elementName="place_detail_report_button"
          onPress={() => {
            if (Platform.OS === 'web') {
              Toast.show('준비 중입니다 💪', {
                duration: Toast.durations.SHORT,
                position: Toast.positions.BOTTOM,
              });
              return;
            }

            onPressInfoUpdateRequest?.();
          }}>
          <Text
            style={{
              fontFamily: font.pretendardRegular,
              fontSize: 13,
              lineHeight: 18,
              color: color.gray60,
              textDecorationLine: 'underline',
              textDecorationColor: color.gray60,
              textDecorationStyle: 'solid',
            }}>
            정보수정 요청
          </Text>
        </SccTouchableOpacity>
      )}
    </View>
  );
}
