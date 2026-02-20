import React from 'react';
import {LayoutChangeEvent, Platform} from 'react-native';
import Toast from 'react-native-root-toast';
import styled from 'styled-components/native';

import FlagIcon from '@/assets/icon/ic_flag_colored.svg';
import PencilIcon from '@/assets/icon/ic_pencil_colored.svg';
import ReviewOutlineIcon from '@/assets/icon/ic_review_outline.svg';
import SirenIcon from '@/assets/icon/ic_siren_colored.svg';
import ThumbsUpIcon from '@/assets/icon/ic_thumbsup_colored.svg';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  AccessibilityInfoV2Dto,
  Place,
  PlaceUpvoteInfoDto,
} from '@/generated-sources/openapi';
import {useUpvoteToggle} from '@/hooks/useUpvoteToggle';
import {useCheckAuth} from '@/utils/checkAuth';

interface V2SummarySectionProps {
  place: Place;
  placeId: string;
  accessibilityScore?: number;
  hasPlaceAccessibility: boolean;
  hasBuildingAccessibility: boolean;
  hasAccessibility: boolean;
  placeUpvoteInfo?: PlaceUpvoteInfoDto;
  accessibility?: AccessibilityInfoV2Dto;
  reviewCount: number;
  onPressRegister: () => void;
  onPressWriteReview: () => void;
  onPressSiren: () => void;
  onNameLayout?: (event: LayoutChangeEvent) => void;
}

export default function V2SummarySection({
  place,
  placeId,
  accessibilityScore,
  hasAccessibility,
  placeUpvoteInfo,
  accessibility,
  reviewCount,
  onPressRegister,
  onPressWriteReview,
  onPressSiren,
  onNameLayout,
}: V2SummarySectionProps) {
  const checkAuth = useCheckAuth();
  const hasScore =
    accessibilityScore !== undefined && accessibilityScore !== null;

  const {
    isUpvoted: _isUpvoted,
    totalUpvoteCount,
    toggleUpvote,
  } = useUpvoteToggle({
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
      <StairLevelBadge hasScore={hasScore}>
        <StairLevelText hasScore={hasScore}>
          {hasScore ? `접근레벨 ${accessibilityScore}` : '접근레벨 -'}
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
          elementName="place_detail_v2_register_button"
          onPress={onPressRegister}>
          <FlagIcon width={16} height={16} />
          <RegisterButtonText>정보등록</RegisterButtonText>
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
          elementName="place_detail_v2_upvote_button"
          onPress={handleUpvote}>
          <ThumbsUpIcon width={16} height={16} />
          <UpvoteButtonText>
            도움돼요
            {(totalUpvoteCount ?? 0) > 0 ? ` ${totalUpvoteCount}` : ''}
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

const StairLevelBadge = styled.View<{hasScore: boolean}>`
  background-color: ${({hasScore}) => (hasScore ? '#D7F6E1' : color.gray15)};
  border-radius: 4px;
  padding-horizontal: ${({hasScore}) => (hasScore ? '6px' : '7px')};
  padding-vertical: 4px;
  align-self: flex-start;
`;

const StairLevelText = styled.Text<{hasScore: boolean}>`
  font-family: ${font.pretendardMedium};
  font-size: 12px;
  letter-spacing: -0.24px;
  color: ${({hasScore}) => (hasScore ? '#06903B' : color.gray50)};
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

const RegisterButton = styled(SccPressable)`
  flex: 1;
  height: 44px;
  border-radius: 8px;
  background-color: ${color.gray15};
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 4px;
`;

const RegisterButtonText = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 14px;
  color: ${color.gray80};
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

const UpvoteButton = styled(SccPressable)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 8px;
  margin-right: 20px;
  padding-vertical: 12px;
  border-radius: 8px;
  background-color: #0e64d3;
`;

const UpvoteButtonText = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 14px;
  color: ${color.white};
`;
