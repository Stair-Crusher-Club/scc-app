import ChevronRightIcon from '@/assets/icon/ic_chevron_right.svg';
import ThumbsUpIcon from '@/assets/icon/ic_thumbs_up.svg';
import ThumbsUpFillIcon from '@/assets/icon/ic_thumbs_up_fill.svg';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {Image, Text, TouchableOpacity, View} from 'react-native';

interface UpvoteButtonProps {
  total?: number;
  upvoted?: boolean;
  onPressUpvote?: () => void;
  onPressInfoUpdateRequest?: () => void;
}

export default function FeedbackButton({
  total,
  upvoted,
  onPressUpvote,
  onPressInfoUpdateRequest,
}: UpvoteButtonProps) {
  return (
    <View
      style={{
        height: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
      <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
        <TouchableOpacity
          onPress={onPressUpvote}
          style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
          {upvoted ? <ThumbsUpFillIcon /> : <ThumbsUpIcon />}
          <Text
            style={{
              fontFamily: font.pretendardMedium,
              fontSize: 13,
              lineHeight: 18,
              color: upvoted ? color.gray80 : color.gray50,
            }}>
            도움돼요
          </Text>
          {total && (
            <View style={{gap: 10, flexDirection: 'row', alignItems: 'center'}}>
              <Text
                style={{
                  fontFamily: font.pretendardMedium,
                  fontSize: 13,
                  lineHeight: 18,
                  color: upvoted ? color.gray80 : color.gray50,
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
        </TouchableOpacity>
        <TouchableOpacity
          style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
          <Image
            source={require('@/assets/img/img_profile.png')}
            style={{
              width: 24,
              height: 24,
            }}
          />
          <ChevronRightIcon />
        </TouchableOpacity>
      </View>

      {onPressInfoUpdateRequest && (
        <TouchableOpacity onPress={onPressInfoUpdateRequest}>
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
        </TouchableOpacity>
      )}
    </View>
  );
}
