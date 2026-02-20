import React from 'react';
import {Platform} from 'react-native';
import Toast from 'react-native-root-toast';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import FlagIcon from '@/assets/icon/ic_flag_colored.svg';
import PencilIcon from '@/assets/icon/ic_pencil_colored.svg';
import SirenIcon from '@/assets/icon/ic_siren_colored.svg';
import ThumbsUpYellowIcon from '@/assets/icon/ic_thumbsup_yellow.svg';
import {SccPressable} from '@/components/SccPressable';
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
  onPressSiren: () => void;
}

export default function V2BottomBar({
  placeId,
  accessibility,
  placeUpvoteInfo,
  onPressRegister,
  onPressWriteReview,
  onPressSiren,
}: Props) {
  const checkAuth = useCheckAuth();
  const insets = useSafeAreaInsets();

  const hasAccessibility =
    !!accessibility?.placeAccessibility ||
    !!accessibility?.buildingAccessibility;

  const {totalUpvoteCount, toggleUpvote} = useUpvoteToggle({
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
    <Container bottomInset={insets.bottom}>
      <ButtonRow>
        {hasAccessibility && (
          <UpvoteButton
            elementName="v2_place_detail_bottom_bar_upvote_button"
            onPress={handleUpvote}>
            <ThumbsUpYellowIcon width={16} height={16} />
            <UpvoteText numberOfLines={1}>
              도움돼요
              {(totalUpvoteCount ?? 0) > 0 ? ` ${totalUpvoteCount}` : ''}
            </UpvoteText>
          </UpvoteButton>
        )}
        <ActionButton
          elementName="v2_place_detail_bottom_bar_register_button"
          onPress={onPressRegister}>
          <FlagIcon width={16} height={16} />
          <ActionButtonText numberOfLines={1}>정보등록</ActionButtonText>
        </ActionButton>
        <ActionButton
          elementName="v2_place_detail_bottom_bar_review_button"
          onPress={onPressWriteReview}>
          <PencilIcon width={16} height={16} />
          <ActionButtonText numberOfLines={1}>리뷰작성</ActionButtonText>
        </ActionButton>
        <SirenButton
          elementName="v2_place_detail_bottom_bar_siren_button"
          onPress={onPressSiren}>
          <SirenIcon width={20} height={20} />
        </SirenButton>
      </ButtonRow>
    </Container>
  );
}

const Container = styled.View<{bottomInset: number}>`
  background-color: ${color.white};
  shadow-color: #000;
  shadow-offset: 0px -4px;
  shadow-opacity: 0.12;
  shadow-radius: 16px;
  elevation: 8;
  padding-top: 12px;
  padding-bottom: ${({bottomInset}) => 24 + bottomInset}px;
  padding-horizontal: 20px;
`;

const ButtonRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const UpvoteButton = styled(SccPressable)`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 44px;
  padding: 0px 8px;
  border-radius: 8px;
  overflow: hidden;
  background-color: ${color.brand40};
`;

const UpvoteText = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 14px;
  line-height: 20px;
  color: ${color.white};
  flex-shrink: 1;
`;

const ActionButton = styled(SccPressable)`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 44px;
  padding: 0px 8px;
  border-radius: 8px;
  overflow: hidden;
  background-color: ${color.gray15};
`;

const ActionButtonText = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 14px;
  line-height: 20px;
  color: #24262b;
  flex-shrink: 1;
`;

const SirenButton = styled(SccPressable)`
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background-color: ${color.gray15};
`;
