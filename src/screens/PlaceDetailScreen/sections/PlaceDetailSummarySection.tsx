import Clipboard from '@react-native-clipboard/clipboard';
import React from 'react';
import styled from 'styled-components/native';

import BookmarkIconOff from '@/assets/icon/ic_bookmark.svg';
import BookmarkIconOn from '@/assets/icon/ic_bookmark_on.svg';
import CopyIcon from '@/assets/icon/ic_copy.svg';
import ShareIcon from '@/assets/icon/ic_share.svg';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {AccessibilityInfoDto, Place} from '@/generated-sources/openapi';
import {LogClick} from '@/logging/LogClick';
import ScoreLabel from '@/screens/SearchScreen/components/ScoreLabel';
import ShareUtils from '@/utils/ShareUtils';
import ToastUtils from '@/utils/ToastUtils';

import {DetailIcon as ElevatorIcon} from '../components/BuildingElevatorInfo';
import {DetailIcon as BuildingStepIcon} from '../components/BuildingEntranceStepInfo';
import {DetailIcon as StepIcon} from '../components/PlaceEntranceStepInfo';
import {DetailIcon as FloorIcon} from '../components/PlaceFloorInfo';
import {
  getPlaceEntranceStepType,
  getFloorAccessibility,
  getBuildingEntranceStepType,
  getBuildingElevatorType,
} from '../components/PlaceInfo.utils';
import * as S from './PlaceDetailSummarySection.style';

interface PlaceDetailSummarySectionProps {
  accessibility?: AccessibilityInfoDto;
  place: Place;
  accessibilityScore?: number;
}

const PlaceDetailSummarySection = ({
  accessibility,
  place,
  accessibilityScore,
}: PlaceDetailSummarySectionProps) => {
  if (!accessibility?.placeAccessibility) {
    return null;
  }

  const onShare = () => {
    ShareUtils.sharePlace(place);
  };

  const onCopy = () => {
    Clipboard.setString(place.address);
    ToastUtils.show('주소가 복사되었습니다.');
  };

  const onBookmark = () => {
    ToastUtils.show('준비중입니다.');
  };

  return (
    <S.Section>
      <S.SubSection>
        <ScoreLabel score={accessibilityScore} />
        <S.Row>
          <S.SectionTitle>{place.name}</S.SectionTitle>
        </S.Row>
        <S.Address>{place.address}</S.Address>
        <LogClick elementName="place_detail_summary_section_copy_button">
          <CopyButton onPress={onCopy}>
            <CopyIcon />
            <CopyText>복사</CopyText>
          </CopyButton>
        </LogClick>
      </S.SubSection>
      <S.Separator />
      <S.Row>
        <LogClick elementName="place_detail_summary_section_save_button">
          <S.Summary onPress={onBookmark}>
            {accessibility.isFavoritePlace ? (
              <BookmarkIconOn />
            ) : (
              <BookmarkIconOff color={color.gray80} />
            )}
            <ButtonText>저장</ButtonText>
          </S.Summary>
        </LogClick>
        <S.VerticalSeparator />
        <LogClick elementName="place_detail_summary_section_share_button">
          <S.Summary onPress={onShare}>
            <ShareIcon />
            <ButtonText>공유</ButtonText>
          </S.Summary>
        </LogClick>
      </S.Row>
    </S.Section>
  );
};

export default PlaceDetailSummarySection;

function PlaceIcons({accessibility}: {accessibility: AccessibilityInfoDto}) {
  // 정보가 등록되지 않은 경우
  if (!accessibility.placeAccessibility) {
    return <S.Empty>-</S.Empty>;
  }

  const floorAccessibility = getFloorAccessibility(accessibility);
  const stepType = getPlaceEntranceStepType(accessibility);

  return (
    <>
      <FloorIcon floorAccessibility={floorAccessibility} />
      <StepIcon entranceStepType={stepType} />
    </>
  );
}

function BuildingIcons({accessibility}: {accessibility: AccessibilityInfoDto}) {
  // 정보가 등록되지 않은 경우
  if (!accessibility.buildingAccessibility) {
    return <S.Empty>-</S.Empty>;
  }

  const entrannceType = getBuildingEntranceStepType(accessibility);
  const elevatorType = getBuildingElevatorType(accessibility);

  return (
    <>
      <BuildingStepIcon entranceStepType={entrannceType} />
      <ElevatorIcon elevatorType={elevatorType} />
    </>
  );
}

const ButtonText = styled.Text`
  color: ${color.gray80};
  font-family: ${font.pretendardMedium};
  font-size: 14px;
`;

const CopyButton = styled.TouchableOpacity`
  margin-top: 4px;
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const CopyText = styled.Text`
  color: ${color.brandColor};
  font-family: ${font.pretendardMedium};
  font-size: 14px;
  text-decoration-line: underline;
`;
