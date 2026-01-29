import Clipboard from '@react-native-clipboard/clipboard';
import React from 'react';
import {Linking, Platform} from 'react-native';
import Toast from 'react-native-root-toast';
import styled from 'styled-components/native';

import BookmarkIconOff from '@/assets/icon/ic_bookmark.svg';
import BookmarkIconOn from '@/assets/icon/ic_bookmark_on.svg';
import CopyIcon from '@/assets/icon/ic_copy.svg';
import ShareIcon from '@/assets/icon/ic_share.svg';

const naverMapIcon = require('@/assets/icon/naver_map.png');
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {AccessibilityInfoDto, Place} from '@/generated-sources/openapi';
import {useToggleFavoritePlace} from '@/hooks/useToggleFavoritePlace';
import ScoreLabel from '@/screens/SearchScreen/components/ScoreLabel';
import ShareUtils from '@/utils/ShareUtils';
import ToastUtils from '@/utils/ToastUtils';
import {getPlaceAccessibilityScore} from '@/utils/accessibilityCheck';
import {useCheckAuth} from '@/utils/checkAuth';

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
  const isFavorite = place.isFavorite;
  const toggleFavorite = useToggleFavoritePlace();
  const checkAuth = useCheckAuth();

  const onShare = () => {
    ShareUtils.sharePlace(place);
  };

  const onCopy = () => {
    Clipboard.setString(place.address);
    ToastUtils.show('주소가 복사되었습니다.');
  };

  const onFavorite = () => {
    if (Platform.OS === 'web') {
      Toast.show('준비 중입니다 💪', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
      });
      return;
    }
    toggleFavorite({
      currentIsFavorite: isFavorite,
      placeId: place.id,
    });
  };

  const onOpenNaverMap = async () => {
    const searchQuery = encodeURIComponent(`${place.name} ${place.address}`);
    const naverMapAppUrl = `nmap://search?query=${searchQuery}&appname=club.staircrusher`;
    const naverMapWebUrl = `https://map.naver.com/p/search/${searchQuery}`;

    try {
      if (Platform.OS === 'web') {
        await Linking.openURL(naverMapWebUrl);
        return;
      }

      const canOpen = await Linking.canOpenURL(naverMapAppUrl);

      if (canOpen) {
        await Linking.openURL(naverMapAppUrl);
      } else {
        await Linking.openURL(naverMapWebUrl);
      }
    } catch {
      ToastUtils.show('링크를 열 수 없습니다');
    }
  };

  if (!accessibility?.placeAccessibility) {
    return (
      <S.Section>
        <S.SubSection>
          <ScoreLabel score={accessibilityScore} />
          <S.Row>
            <S.SectionTitle>{place.name}</S.SectionTitle>
          </S.Row>
          <S.Address>{place.address}</S.Address>
          <AddressButtonRow>
            <CopyButton
              elementName="place_detail_summary_section_copy_button"
              onPress={onCopy}>
              <CopyIcon />
              <CopyText>복사</CopyText>
            </CopyButton>
            <NaverMapLink
              elementName="place_detail_summary_section_naver_map_link"
              onPress={onOpenNaverMap}>
              <NaverMapIcon source={naverMapIcon} />
              <NaverMapText>네이버에서 보기</NaverMapText>
            </NaverMapLink>
          </AddressButtonRow>
        </S.SubSection>
        <S.Separator />
        <S.Row>
          <S.Summary
            elementName="place_detail_summary_section_toggle_favorite_button"
            logParams={{
              isFavoritePlace: isFavorite,
            }}
            onPress={() => checkAuth(onFavorite)}>
            {isFavorite ? (
              <BookmarkIconOn color={color.brandColor} />
            ) : (
              <BookmarkIconOff color={color.gray80} />
            )}
            <ButtonText>저장</ButtonText>
          </S.Summary>
          <S.VerticalSeparator />
          <S.Summary
            elementName="place_detail_summary_section_share_button"
            onPress={onShare}>
            <ShareIcon />
            <ButtonText>공유</ButtonText>
          </S.Summary>
        </S.Row>
      </S.Section>
    );
  }

  return (
    <S.Section>
      <S.SubSection>
        <ScoreLabel
          score={getPlaceAccessibilityScore({
            score: accessibilityScore,
            hasPlaceAccessibility: !!accessibility.placeAccessibility,
            hasBuildingAccessibility: !!accessibility.buildingAccessibility,
          })}
        />
        <S.Row>
          <S.SectionTitle>{place.name}</S.SectionTitle>
        </S.Row>
        <S.Address>{place.address}</S.Address>
        <AddressButtonRow>
          <CopyButton
            elementName="place_detail_summary_section_copy_button"
            onPress={onCopy}>
            <CopyIcon />
            <CopyText>복사</CopyText>
          </CopyButton>
          <NaverMapLink
            elementName="place_detail_summary_section_naver_map_link"
            onPress={onOpenNaverMap}>
            <NaverMapIcon source={naverMapIcon} />
            <NaverMapText>네이버에서 보기</NaverMapText>
          </NaverMapLink>
        </AddressButtonRow>
      </S.SubSection>
      <S.Separator />
      <S.Row>
        <S.Summary
          elementName="place_detail_summary_section_toggle_favorite_button"
          logParams={{
            is_favorite_place: isFavorite,
          }}
          onPress={() => checkAuth(onFavorite)}>
          {isFavorite ? (
            <BookmarkIconOn color={color.brandColor} />
          ) : (
            <BookmarkIconOff color={color.gray80} />
          )}
          <ButtonText>저장</ButtonText>
        </S.Summary>
        <S.VerticalSeparator />
        <S.Summary
          elementName="place_detail_summary_section_share_button"
          onPress={onShare}>
          <ShareIcon />
          <ButtonText>공유</ButtonText>
        </S.Summary>
      </S.Row>
    </S.Section>
  );
};

export default PlaceDetailSummarySection;

const ButtonText = styled.Text`
  color: ${color.gray80};
  font-family: ${font.pretendardMedium};
  font-size: 14px;
`;

const CopyButton = styled(SccTouchableOpacity)`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const CopyText = styled.Text`
  color: ${color.blue50};
  font-family: ${font.pretendardMedium};
  font-size: 13px;
  text-decoration-line: underline;
`;

const AddressButtonRow = styled.View`
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  margin-top: 4px;
`;

const NaverMapLink = styled(SccTouchableOpacity)`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const NaverMapIcon = styled.Image`
  width: 16px;
  height: 16px;
  border-radius: 2px;
`;

const NaverMapText = styled.Text`
  color: ${color.gray60};
  font-family: ${font.pretendardMedium};
  font-size: 13px;
  text-decoration-line: underline;
`;
