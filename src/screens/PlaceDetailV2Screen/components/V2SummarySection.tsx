import React from 'react';
import {LayoutChangeEvent} from 'react-native';
import styled from 'styled-components/native';

import CheckColoredIcon from '@/assets/icon/ic_check_colored.svg';
import FlagIcon from '@/assets/icon/ic_flag_colored.svg';
import PencilIcon from '@/assets/icon/ic_pencil_colored.svg';
import ReviewOutlineIcon from '@/assets/icon/ic_review_outline.svg';
import SirenIcon from '@/assets/icon/ic_siren_colored.svg';
import ThumbsUpIcon from '@/assets/icon/ic_thumbsup_colored.svg';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {AccessibilityInfoV2Dto, Place} from '@/generated-sources/openapi';

interface V2SummarySectionProps {
  place: Place;
  accessibilityScore?: number;
  hasAccessibility: boolean;
  isUpvoted: boolean;
  totalUpvoteCount: number | undefined;
  onPressUpvote: () => void;
  accessibility?: AccessibilityInfoV2Dto;
  reviewCount: number;
  onPressRegister: () => void;
  onPressWriteReview: () => void;
  onPressSiren: () => void;
  onNameLayout?: (event: LayoutChangeEvent) => void;
}

export default function V2SummarySection({
  place,
  accessibilityScore,
  hasAccessibility,
  isUpvoted,
  totalUpvoteCount: _totalUpvoteCount,
  onPressUpvote,
  accessibility,
  reviewCount,
  onPressRegister,
  onPressWriteReview,
  onPressSiren,
  onNameLayout,
}: V2SummarySectionProps) {
  const hasScore =
    accessibilityScore !== undefined && accessibilityScore !== null;

  const isProcessing =
    !hasScore &&
    !!accessibility?.placeAccessibility &&
    !accessibility?.buildingAccessibility;

  const tagTexts = (() => {
    const pa = accessibility?.placeAccessibility;
    if (!pa) {
      return [];
    }

    let floorTag;
    let slopeTag;

    const floors = pa.floors ?? [];
    floorTag = floors.length
      ? `${floors[0]}층${floors.length > 1 ? '+' : ''}`
      : undefined;

    slopeTag = pa.hasSlope
      ? '경사로있음'
      : !pa.hasSlope && (accessibilityScore ?? 0) !== 0
        ? '경사로없음'
        : undefined;

    return [floorTag, slopeTag].filter(tag => tag) as string[];
  })();

  const hasReview = reviewCount > 0;

  return (
    <Container>
      <StairLevelBadge hasScore={hasScore} isProcessing={isProcessing}>
        <StairLevelText hasScore={hasScore} isProcessing={isProcessing}>
          {hasScore
            ? `접근레벨 ${accessibilityScore}`
            : isProcessing
              ? '계산중(건물정보 필요)'
              : '접근레벨 -'}
        </StairLevelText>
      </StairLevelBadge>
      <NameContainer onLayout={onNameLayout}>
        <PlaceName>{place.name}</PlaceName>
      </NameContainer>
      {accessibility?.placeAccessibility && (
        <V2TagsRow>
          {tagTexts.map((text, index) => (
            <React.Fragment key={index}>
              {index > 0 && <V2TagDot />}
              <V2TagText>{text}</V2TagText>
            </React.Fragment>
          ))}
          {hasReview && (
            <>
              {tagTexts.length > 0 && <V2TagDot />}
              <V2ReviewContainer>
                <ReviewOutlineIcon
                  width={16}
                  height={16}
                  color={color.gray60}
                />
                <V2TagText>
                  {'리뷰 '}
                  <V2ReviewCount>{reviewCount}</V2ReviewCount>
                </V2TagText>
              </V2ReviewContainer>
            </>
          )}
        </V2TagsRow>
      )}
      <ActionButtonsRow>
        <RegisterButton
          isPrimary={!hasAccessibility}
          elementName="place_detail_v2_register_button"
          onPress={onPressRegister}>
          <FlagIcon width={16} height={16} color={!hasAccessibility ? color.white : undefined} />
          <RegisterButtonText isPrimary={!hasAccessibility}>정보등록</RegisterButtonText>
        </RegisterButton>
        <ReviewButton
          elementName="place_detail_v2_write_review_button"
          onPress={onPressWriteReview}>
          <PencilIcon width={16} height={16} />
          <ReviewButtonText>리뷰작성</ReviewButtonText>
        </ReviewButton>
        <SirenButton
          elementName="place_detail_v2_siren_button"
          onPress={onPressSiren}>
          <SirenIcon width={20} height={20} />
        </SirenButton>
      </ActionButtonsRow>
      {hasAccessibility && (
        <UpvoteButton
          isUpvoted={isUpvoted}
          elementName="place_detail_v2_upvote_button"
          onPress={onPressUpvote}>
          {isUpvoted ? (
            <CheckColoredIcon width={16} height={16} />
          ) : (
            <ThumbsUpIcon width={16} height={16} />
          )}
          <UpvoteButtonText isUpvoted={isUpvoted}>
            {isUpvoted ? '도움됐어요' : '도움돼요'}
          </UpvoteButtonText>
        </UpvoteButton>
      )}
    </Container>
  );
}

const Container = styled.View`
  padding-left: 20px;
  padding-top: 4px;
  padding-bottom: 20px;
`;

const StairLevelBadge = styled.View<{
  hasScore: boolean;
  isProcessing: boolean;
}>`
  background-color: ${({hasScore, isProcessing}) =>
    hasScore ? '#D7F6E1' : isProcessing ? '#ffffff' : color.gray15};
  border-radius: 4px;
  padding-horizontal: ${({hasScore}) => (hasScore ? '6px' : '7px')};
  padding-vertical: 4px;
  align-self: flex-start;
  ${({isProcessing}) =>
    isProcessing ? `border-width: 1px; border-color: #FFC109;` : ''}
`;

const StairLevelText = styled.Text<{
  hasScore: boolean;
  isProcessing: boolean;
}>`
  font-family: ${font.pretendardMedium};
  font-size: 12px;
  letter-spacing: -0.24px;
  color: ${({hasScore, isProcessing}) =>
    hasScore ? '#06903B' : isProcessing ? '#FFC109' : color.gray50};
`;

const NameContainer = styled.View`
  margin-top: 8px;
  padding-bottom: 6px;
`;

const PlaceName = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 20px;
  line-height: 28px;
  letter-spacing: -0.4px;
  color: ${color.black};
`;

const V2TagsRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
`;

const V2TagDot = styled.View`
  width: 2px;
  height: 2px;
  border-radius: 1px;
  background-color: ${color.gray30};
`;

const V2TagText = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 13px;
  line-height: 18px;
  letter-spacing: -0.26px;
  color: ${color.gray60};
`;

const V2ReviewContainer = styled.View`
  flex-direction: row;
  align-items: flex-end;
  gap: 2px;
`;

const V2ReviewCount = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 13px;
  line-height: 18px;
  letter-spacing: -0.26px;
  color: ${color.brand50};
`;

const ActionButtonsRow = styled.View`
  flex-direction: row;
  gap: 8px;
  margin-top: 20px;
  padding-right: 20px;
`;

const RegisterButton = styled(SccPressable)<{isPrimary?: boolean}>`
  flex: 1;
  height: 44px;
  border-radius: 8px;
  background-color: ${({isPrimary}) => (isPrimary ? color.brand40 : color.gray15)};
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 4px;
`;

const RegisterButtonText = styled.Text<{isPrimary?: boolean}>`
  font-family: ${font.pretendardMedium};
  font-size: 14px;
  color: ${({isPrimary}) => (isPrimary ? color.white : color.gray80)};
`;

const ReviewButton = styled(SccPressable)`
  flex: 1;
  height: 44px;
  border-radius: 8px;
  background-color: ${color.gray15};
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 4px;
`;

const ReviewButtonText = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 14px;
  color: ${color.gray80};
`;

const SirenButton = styled(SccPressable)`
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background-color: ${color.gray15};
  align-items: center;
  justify-content: center;
  padding: 10px;
`;

const UpvoteButton = styled(SccPressable)<{isUpvoted: boolean}>`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 8px;
  margin-right: 20px;
  padding-vertical: 12px;
  border-radius: 8px;
  background-color: ${({isUpvoted}) => (isUpvoted ? '#D6EBFF' : '#0e64d3')};
`;

const UpvoteButtonText = styled.Text<{isUpvoted: boolean}>`
  font-family: ${font.pretendardMedium};
  font-size: 14px;
  color: ${({isUpvoted}) => (isUpvoted ? '#000000' : color.white)};
`;
