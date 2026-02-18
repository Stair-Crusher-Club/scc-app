import React from 'react';
import styled from 'styled-components/native';

import PlusIcon from '@/assets/icon/ic_plus.svg';
import ReviewIcon from '@/assets/icon/ic_review.svg';
import WarningIcon from '@/assets/icon/ic_warning.svg';
import {SccPressable} from '@/components/SccPressable';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {Place} from '@/generated-sources/openapi';

interface V2SummarySectionProps {
  place: Place;
  accessibilityScore?: number;
  hasPlaceAccessibility: boolean;
  hasBuildingAccessibility: boolean;
  onPressRegister: () => void;
  onPressWriteReview: () => void;
  onPressSiren: () => void;
}

export default function V2SummarySection({
  place,
  accessibilityScore,
  onPressRegister,
  onPressWriteReview,
  onPressSiren,
}: V2SummarySectionProps) {
  const hasScore =
    accessibilityScore !== undefined && accessibilityScore !== null;

  return (
    <Container>
      <StairLevelBadge hasScore={hasScore}>
        <StairLevelText hasScore={hasScore}>
          {hasScore ? `접근레벨 ${accessibilityScore}` : '접근레벨 -'}
        </StairLevelText>
      </StairLevelBadge>
      <NameContainer>
        <PlaceName>{place.name}</PlaceName>
      </NameContainer>
      <ActionButtonsRow>
        <RegisterButton
          elementName="place_detail_v2_register_button"
          onPress={onPressRegister}>
          <PlusIcon width={16} height={16} color={color.white} />
          <RegisterButtonText>정보등록</RegisterButtonText>
        </RegisterButton>
        <ReviewButton
          elementName="place_detail_v2_write_review_button"
          onPress={onPressWriteReview}>
          <ReviewIcon width={16} height={16} color="#24262B" />
          <ReviewButtonText>리뷰작성</ReviewButtonText>
        </ReviewButton>
        <SirenButton
          elementName="place_detail_v2_siren_button"
          onPress={onPressSiren}>
          <WarningIcon width={20} height={20} color="#16181C" />
        </SirenButton>
      </ActionButtonsRow>
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
  background-color: ${color.brand40};
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 4px;
`;

const RegisterButtonText = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 14px;
  color: ${color.white};
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
