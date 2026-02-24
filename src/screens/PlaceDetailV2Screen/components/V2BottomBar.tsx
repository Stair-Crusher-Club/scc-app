import React from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import CheckColoredIcon from '@/assets/icon/ic_check_colored.svg';
import FlagIcon from '@/assets/icon/ic_flag_colored.svg';
import PencilIcon from '@/assets/icon/ic_pencil_colored.svg';
import SirenIcon from '@/assets/icon/ic_siren_colored.svg';
import ThumbsUpIcon from '@/assets/icon/ic_thumbsup_colored.svg';
import ThumbsUpYellowIcon from '@/assets/icon/ic_thumbsup_yellow.svg';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {AccessibilityInfoV2Dto} from '@/generated-sources/openapi';
import {useIsUpvoteIconOnly} from '@/hooks/useExperiment';

interface Props {
  accessibility?: AccessibilityInfoV2Dto;
  isUpvoted: boolean;
  totalUpvoteCount: number | undefined;
  onPressUpvote: () => void;
  onPressRegister: () => void;
  onPressWriteReview: () => void;
  onPressSiren: () => void;
}

export default function V2BottomBar({
  accessibility,
  isUpvoted,
  totalUpvoteCount: _totalUpvoteCount,
  onPressUpvote,
  onPressRegister,
  onPressWriteReview,
  onPressSiren,
}: Props) {
  const insets = useSafeAreaInsets();
  const isIconOnly = useIsUpvoteIconOnly();

  const hasAccessibility =
    !!accessibility?.placeAccessibility ||
    !!accessibility?.buildingAccessibility;

  return (
    <Container bottomInset={insets.bottom}>
      <ButtonRow>
        {!isIconOnly && hasAccessibility && (
          <UpvoteButton
            isUpvoted={isUpvoted}
            elementName="v2_place_detail_bottom_bar_upvote_button"
            logParams={{
              experimentVariant: 'CONTROL',
            }}
            onPress={onPressUpvote}>
            {isUpvoted ? (
              <CheckColoredIcon width={16} height={16} />
            ) : (
              <ThumbsUpYellowIcon width={16} height={16} />
            )}
            <UpvoteText isUpvoted={isUpvoted} numberOfLines={1}>
              {isUpvoted ? '도움됐어요' : '도움돼요'}
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
        {isIconOnly && hasAccessibility && (
          <IconUpvoteButton
            isUpvoted={isUpvoted}
            elementName="v2_place_detail_bottom_bar_upvote_icon_button"
            logParams={{
              experimentVariant: 'TREATMENT_1',
            }}
            onPress={onPressUpvote}>
            <ThumbsUpIcon
              width={20}
              height={20}
              color={isUpvoted ? color.brand40 : color.gray60}
            />
          </IconUpvoteButton>
        )}
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

const UpvoteButton = styled(SccPressable)<{isUpvoted: boolean}>`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 12px 0px;
  border-radius: 8px;
  overflow: hidden;
  background-color: ${({isUpvoted}) => (isUpvoted ? '#D6EBFF' : color.brand40)};
`;

const UpvoteText = styled.Text.attrs({
  style: {includeFontPadding: false, textAlignVertical: 'center'},
})<{isUpvoted: boolean}>`
  font-family: ${font.pretendardMedium};
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.28px;
  color: ${({isUpvoted}) => (isUpvoted ? '#000000' : color.white)};
  flex-shrink: 1;
`;

const ActionButton = styled(SccPressable)`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 12px 0px;
  border-radius: 8px;
  overflow: hidden;
  background-color: ${color.gray15};
`;

const ActionButtonText = styled.Text.attrs({
  style: {includeFontPadding: false, textAlignVertical: 'center'},
})`
  font-family: ${font.pretendardMedium};
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.28px;
  color: #24262b;
  flex-shrink: 1;
`;

const IconUpvoteButton = styled(SccPressable)<{isUpvoted: boolean}>`
  width: 44px;
  height: 44px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  background-color: ${({isUpvoted}) => (isUpvoted ? '#D6EBFF' : color.gray15)};
  ${({isUpvoted}) =>
    !isUpvoted ? 'border-width: 1px; border-color: #E3E4E8;' : ''}
`;

const SirenButton = styled(SccPressable)`
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background-color: ${color.gray15};
`;
