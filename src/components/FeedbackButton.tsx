import ChevronRightIcon from '@/assets/icon/ic_chevron_right.svg';
import ThumbsUpIcon from '@/assets/icon/ic_thumbs_up.svg';
import ThumbsUpFillIcon from '@/assets/icon/ic_thumbs_up_fill.svg';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {Image, Platform} from 'react-native';
import Toast from 'react-native-root-toast';
import styled from 'styled-components/native';
import SccTouchableOpacity from './SccTouchableOpacity';

interface FeedbackButtonProps {
  total?: number;
  isUpvoted?: boolean;
  onPressUpvote: () => void;
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
    <Container>
      <LeftSection>
        <UpvoteButton
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
          }}>
          {isUpvoted ? <ThumbsUpFillIcon /> : <ThumbsUpIcon />}
          <UpvoteText isUpvoted={isUpvoted}>도움돼요</UpvoteText>
          {typeof total === 'number' && total > 0 && (
            <CountSection>
              <CountText isUpvoted={isUpvoted}>{total}</CountText>
              <Divider />
            </CountSection>
          )}
        </UpvoteButton>
        {typeof total === 'number' && total > 0 && (
          <AnalyticsButton
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
            }}>
            <ProfileImage source={require('@/assets/img/img_profile.png')} />
            <ChevronRightIcon />
          </AnalyticsButton>
        )}
      </LeftSection>

      {onPressInfoUpdateRequest && (
        <InfoUpdateButton
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
          <InfoUpdateText>정보수정 요청</InfoUpdateText>
        </InfoUpdateButton>
      )}
    </Container>
  );
}

const Container = styled.View`
  height: 24px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const LeftSection = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;

const UpvoteButton = styled(SccTouchableOpacity)`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const UpvoteText = styled.Text<{isUpvoted?: boolean}>`
  font-family: ${font.pretendardMedium};
  font-size: 13px;
  line-height: 18px;
  color: ${props => (props.isUpvoted ? color.gray80 : color.gray50)};
`;

const CountSection = styled.View`
  gap: 10px;
  flex-direction: row;
  align-items: center;
`;

const CountText = styled.Text<{isUpvoted?: boolean}>`
  font-family: ${font.pretendardMedium};
  font-size: 13px;
  line-height: 18px;
  color: ${props => (props.isUpvoted ? color.gray80 : color.gray50)};
`;

const Divider = styled.View`
  width: 1px;
  height: 16px;
  background-color: ${color.gray20};
`;

const AnalyticsButton = styled(SccTouchableOpacity)`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const ProfileImage = styled(Image)`
  width: 24px;
  height: 24px;
`;

const InfoUpdateButton = styled(SccTouchableOpacity)``;

const InfoUpdateText = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 13px;
  line-height: 18px;
  color: ${color.gray60};
  text-decoration-line: underline;
  text-decoration-color: ${color.gray60};
  text-decoration-style: solid;
`;
