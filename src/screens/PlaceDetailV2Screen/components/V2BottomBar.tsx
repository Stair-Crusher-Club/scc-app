import React from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import CheckColoredIcon from '@/assets/icon/ic_check_colored.svg';
import FlagIcon from '@/assets/icon/ic_flag_colored.svg';
import PencilIcon from '@/assets/icon/ic_pencil_colored.svg';
import SirenIcon from '@/assets/icon/ic_siren_colored.svg';
import SirenOutlineIcon from '@/assets/icon/ic_siren_outline.svg';
import ThumbsUpBlueIcon from '@/assets/icon/ic_thumbsup_blue.svg';
import ThumbsUpOutlineIcon from '@/assets/icon/ic_thumbsup_outline.svg';
import ThumbsUpYellowIcon from '@/assets/icon/ic_thumbsup_yellow.svg';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {AccessibilityInfoV2Dto} from '@/generated-sources/openapi';
import {useExperimentVariant} from '@/hooks/useExperiment';

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
  const upvoteVariant = useExperimentVariant('UPVOTE_BUTTON_STYLE');
  const isIconOnly = upvoteVariant === 'TREATMENT_1';

  const hasAccessibility =
    !!accessibility?.placeAccessibility ||
    !!accessibility?.buildingAccessibility;

  if (isIconOnly) {
    return (
      <Container bottomInset={insets.bottom}>
        <ButtonRow>
          <T1ActionButton
            elementName="v2_place_detail_bottom_bar_register_button"
            logParams={{experimentVariant: upvoteVariant}}
            onPress={onPressRegister}>
            <FlagIcon width={20} height={20} />
            <T1ActionButtonText numberOfLines={1}>정보등록</T1ActionButtonText>
          </T1ActionButton>
          <T1ActionButton
            elementName="v2_place_detail_bottom_bar_review_button"
            logParams={{experimentVariant: upvoteVariant}}
            onPress={onPressWriteReview}>
            <PencilIcon width={20} height={20} />
            <T1ActionButtonText numberOfLines={1}>리뷰작성</T1ActionButtonText>
          </T1ActionButton>
          {hasAccessibility && (
            <T1IconUpvoteButton
              elementName="v2_place_detail_bottom_bar_upvote_icon_button"
              logParams={{experimentVariant: upvoteVariant}}
              onPress={onPressUpvote}>
              {isUpvoted ? (
                <ThumbsUpBlueIcon width={24} height={24} />
              ) : (
                <ThumbsUpOutlineIcon width={24} height={24} />
              )}
            </T1IconUpvoteButton>
          )}
          <T1SirenButton
            elementName="v2_place_detail_bottom_bar_siren_button"
            logParams={{experimentVariant: upvoteVariant}}
            onPress={onPressSiren}>
            <SirenOutlineIcon width={24} height={24} />
          </T1SirenButton>
        </ButtonRow>
      </Container>
    );
  }

  return (
    <Container bottomInset={insets.bottom}>
      <ButtonRow>
        {hasAccessibility && (
          <UpvoteButton
            isUpvoted={isUpvoted}
            elementName="v2_place_detail_bottom_bar_upvote_button"
            logParams={{experimentVariant: upvoteVariant}}
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
        <RegisterActionButton
          isPrimary={!hasAccessibility}
          elementName="v2_place_detail_bottom_bar_register_button"
          logParams={{experimentVariant: upvoteVariant}}
          onPress={onPressRegister}>
          <FlagIcon
            width={16}
            height={16}
            color={!hasAccessibility ? color.white : undefined}
          />
          <RegisterActionButtonText
            isPrimary={!hasAccessibility}
            numberOfLines={1}>
            정보등록
          </RegisterActionButtonText>
        </RegisterActionButton>
        <ActionButton
          elementName="v2_place_detail_bottom_bar_review_button"
          logParams={{experimentVariant: upvoteVariant}}
          onPress={onPressWriteReview}>
          <PencilIcon width={16} height={16} />
          <ActionButtonText numberOfLines={1}>리뷰작성</ActionButtonText>
        </ActionButton>
        <SirenButton
          elementName="v2_place_detail_bottom_bar_siren_button"
          logParams={{experimentVariant: upvoteVariant}}
          onPress={onPressSiren}>
          <SirenIcon width={20} height={20} />
        </SirenButton>
      </ButtonRow>
    </Container>
  );
}

// --- Shared ---

const Container = styled.View<{bottomInset: number}>`
  background-color: ${color.white};
  shadow-color: #000;
  shadow-offset: 0px -4px;
  shadow-opacity: 0.12;
  shadow-radius: 16px;
  padding-top: 12px;
  padding-bottom: ${({bottomInset}) => 24 + bottomInset}px;
  padding-horizontal: 20px;
`;

const ButtonRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

// --- CONTROL styled components ---

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

const RegisterActionButton = styled(SccPressable)<{isPrimary?: boolean}>`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 12px 0px;
  border-radius: 8px;
  overflow: hidden;
  background-color: ${({isPrimary}) =>
    isPrimary ? color.brand40 : color.gray15};
`;

const RegisterActionButtonText = styled.Text.attrs({
  style: {includeFontPadding: false, textAlignVertical: 'center'},
})<{isPrimary?: boolean}>`
  font-family: ${font.pretendardMedium};
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.28px;
  color: ${({isPrimary}) => (isPrimary ? color.white : '#24262b')};
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

// --- TREATMENT_1 styled components ---

const T1ActionButton = styled(SccPressable)`
  flex: 1;
  height: 44px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border-radius: 8px;
  overflow: hidden;
  background-color: #d6ebff;
`;

const T1ActionButtonText = styled.Text.attrs({
  style: {includeFontPadding: false, textAlignVertical: 'center'},
})`
  font-family: ${font.pretendardMedium};
  font-size: 15px;
  line-height: 22px;
  letter-spacing: -0.3px;
  color: #24262b;
  flex-shrink: 1;
`;

const T1IconUpvoteButton = styled(SccPressable)`
  width: 44px;
  height: 44px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-width: 1px;
  border-color: #e3e4e8;
`;

const T1SirenButton = styled(SccPressable)`
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  overflow: hidden;
  border-width: 1px;
  border-color: #e3e4e8;
`;
