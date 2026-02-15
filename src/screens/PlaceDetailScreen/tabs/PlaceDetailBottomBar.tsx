import React from 'react';
import {Platform} from 'react-native';
import Toast from 'react-native-root-toast';
import styled from 'styled-components/native';

import ThumbsUpIcon from '@/assets/icon/ic_thumbs_up.svg';
import ThumbsUpFillIcon from '@/assets/icon/ic_thumbs_up_fill.svg';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  AccessibilityInfoV2Dto,
  PlaceUpvoteInfoDto,
} from '@/generated-sources/openapi';
import {useUpvoteToggle} from '@/hooks/useUpvoteToggle';
import {useCheckAuth} from '@/utils/checkAuth';

interface Props {
  placeId: string;
  accessibility?: AccessibilityInfoV2Dto;
  placeUpvoteInfo?: PlaceUpvoteInfoDto;
  onPressRegister: () => void;
  onPressWriteReview: () => void;
}

export default function PlaceDetailBottomBar({
  placeId,
  accessibility,
  placeUpvoteInfo,
  onPressRegister,
  onPressWriteReview,
}: Props) {
  const checkAuth = useCheckAuth();

  const hasAccessibility =
    !!accessibility?.placeAccessibility ||
    !!accessibility?.buildingAccessibility;

  const {isUpvoted, totalUpvoteCount, toggleUpvote} = useUpvoteToggle({
    initialIsUpvoted: placeUpvoteInfo?.isUpvoted ?? false,
    initialTotalCount: placeUpvoteInfo?.totalUpvoteCount,
    targetId: placeId,
    targetType: 'PLACE',
    placeId: placeId,
  });

  const handleUpvote = () => {
    if (Platform.OS === 'web') {
      Toast.show('준비 중입니다 💪', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
      });
      return;
    }
    checkAuth(() => toggleUpvote());
  };

  return (
    <Container>
      {hasAccessibility && (
        <UpvoteButton
          elementName="place_detail_bottom_bar_upvote_button"
          onPress={handleUpvote}>
          {isUpvoted ? (
            <ThumbsUpFillIcon width={20} height={20} />
          ) : (
            <ThumbsUpIcon width={20} height={20} />
          )}
          <UpvoteText isUpvoted={isUpvoted}>
            도움돼요{(totalUpvoteCount ?? 0) > 0 ? ` ${totalUpvoteCount}` : ''}
          </UpvoteText>
        </UpvoteButton>
      )}
      <ActionButtonsContainer>
        <ActionButton
          elementName="place_detail_bottom_bar_register_button"
          onPress={onPressRegister}>
          <ActionButtonText>정보등록</ActionButtonText>
        </ActionButton>
        <ActionButton
          elementName="place_detail_bottom_bar_review_button"
          isPrimary
          onPress={onPressWriteReview}>
          <ActionButtonText isPrimary>리뷰작성</ActionButtonText>
        </ActionButton>
      </ActionButtonsContainer>
    </Container>
  );
}

const Container = styled.View`
  flex-direction: row;
  align-items: center;
  padding-horizontal: 16px;
  padding-vertical: 8px;
  background-color: ${color.white};
  border-top-width: 1px;
  border-top-color: ${color.gray20};
  gap: 12px;
`;

const UpvoteButton = styled(SccTouchableOpacity)`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border-radius: 20px;
  border-width: 1px;
  border-color: ${color.gray20};
`;

const UpvoteText = styled.Text<{isUpvoted: boolean}>`
  font-family: ${font.pretendardMedium};
  font-size: 13px;
  line-height: 18px;
  color: ${({isUpvoted}) => (isUpvoted ? color.brand50 : color.gray60)};
`;

const ActionButtonsContainer = styled.View`
  flex: 1;
  flex-direction: row;
  gap: 8px;
  justify-content: flex-end;
`;

const ActionButton = styled(SccTouchableOpacity)<{isPrimary?: boolean}>`
  padding: 10px 16px;
  border-radius: 8px;
  background-color: ${({isPrimary}) =>
    isPrimary ? color.brand40 : color.gray15};
`;

const ActionButtonText = styled.Text<{isPrimary?: boolean}>`
  font-family: ${font.pretendardBold};
  font-size: 14px;
  line-height: 20px;
  color: ${({isPrimary}) => (isPrimary ? color.white : color.gray70)};
`;
