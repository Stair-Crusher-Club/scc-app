import Clipboard from '@react-native-clipboard/clipboard';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React from 'react';
import {Linking, Platform} from 'react-native';
import Toast from 'react-native-root-toast';
import styled from 'styled-components/native';

import BookmarkIconOff from '@/assets/icon/ic_bookmark.svg';
import BookmarkIconOn from '@/assets/icon/ic_bookmark_on.svg';
import ClockIcon from '@/assets/icon/ic_clock.svg';
import CopyIcon from '@/assets/icon/ic_copy.svg';
import NavigationIcon from '@/assets/icon/ic_navigation.svg';
import ReviewOutlineIcon from '@/assets/icon/ic_review_outline.svg';
import ShareIcon from '@/assets/icon/ic_share.svg';

import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {AccessibilityInfoDto, Place} from '@/generated-sources/openapi';
import {useToggleFavoritePlace} from '@/hooks/useToggleFavoritePlace';
import type {ScreenParams} from '@/navigation/Navigation.screens';
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
  kakaoPlaceId?: string;
  onOpenNavigation: () => void;
}

const PlaceDetailSummarySection = ({
  accessibility,
  place,
  accessibilityScore,
  kakaoPlaceId,
  onOpenNavigation,
}: PlaceDetailSummarySectionProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<ScreenParams>>();
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

  const getExternalUrl = (hash: string) => {
    if (kakaoPlaceId) {
      return `https://place.map.kakao.com/${kakaoPlaceId}#${hash}`;
    }
    // Fallback to Naver search
    const searchQuery = encodeURIComponent(`${place.name} ${place.address}`);
    return `https://map.naver.com/p/search/${searchQuery}`;
  };

  const onOpenPlaceReview = async () => {
    const url = getExternalUrl('review');
    if (Platform.OS === 'web') {
      await Linking.openURL(url);
      return;
    }
    navigation.navigate('Webview', {url, headerVariant: 'navigation'});
  };

  const onOpenBusinessHours = async () => {
    const url = getExternalUrl('home');
    if (Platform.OS === 'web') {
      await Linking.openURL(url);
      return;
    }
    navigation.navigate('Webview', {url, headerVariant: 'navigation'});
  };

  if (!accessibility?.placeAccessibility) {
    return (
      <S.Section>
        <S.SubSection>
          <ScoreLabel score={accessibilityScore} />
          <S.Row>
            <S.SectionTitle>{place.name}</S.SectionTitle>
          </S.Row>
          <AddressRow>
            <AddressText>{place.address}</AddressText>
            <CopyButton
              elementName="place_detail_summary_section_copy_button"
              onPress={onCopy}>
              <CopyIcon width={14} height={14} />
              <CopyText>복사</CopyText>
            </CopyButton>
          </AddressRow>
          <ExternalLinkRow>
            <ExternalLinkButton
              elementName="place_detail_summary_section_place_review_link"
              onPress={onOpenPlaceReview}>
              <ReviewOutlineIcon width={14} height={14} color={color.gray60} />
              <ExternalLinkText>장소 리뷰</ExternalLinkText>
            </ExternalLinkButton>
            <ExternalLinkButton
              elementName="place_detail_summary_section_business_hours_link"
              onPress={onOpenBusinessHours}>
              <ClockIcon width={14} height={14} color={color.gray60} />
              <ExternalLinkText>영업시간</ExternalLinkText>
            </ExternalLinkButton>
            <ExternalLinkButton
              elementName="place_detail_summary_section_navigation_button"
              onPress={onOpenNavigation}>
              <NavigationIcon width={14} height={14} color={color.gray60} />
              <ExternalLinkText>길찾기</ExternalLinkText>
            </ExternalLinkButton>
          </ExternalLinkRow>
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
        <AddressRow>
          <AddressText>{place.address}</AddressText>
          <CopyButton
            elementName="place_detail_summary_section_copy_button"
            onPress={onCopy}>
            <CopyIcon width={14} height={14} />
            <CopyText>복사</CopyText>
          </CopyButton>
        </AddressRow>
        <ExternalLinkRow>
          <ExternalLinkButton
            elementName="place_detail_summary_section_place_review_link"
            onPress={onOpenPlaceReview}>
            <ReviewOutlineIcon width={14} height={14} color={color.gray60} />
            <ExternalLinkText>장소 리뷰</ExternalLinkText>
          </ExternalLinkButton>
          <ExternalLinkButton
            elementName="place_detail_summary_section_business_hours_link"
            onPress={onOpenBusinessHours}>
            <ClockIcon width={14} height={14} color={color.gray60} />
            <ExternalLinkText>영업시간</ExternalLinkText>
          </ExternalLinkButton>
          <ExternalLinkButton
            elementName="place_detail_summary_section_navigation_button"
            onPress={onOpenNavigation}>
            <NavigationIcon width={14} height={14} color={color.gray60} />
            <ExternalLinkText>길찾기</ExternalLinkText>
          </ExternalLinkButton>
        </ExternalLinkRow>
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
  font-size: 14px;
  text-decoration-line: underline;
`;

const AddressText = styled.Text`
  font-size: 14px;
  font-family: ${font.pretendardRegular};
`;

const AddressRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
`;

const ExternalLinkRow = styled.View`
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  margin-top: 8px;
`;

const ExternalLinkButton = styled(SccTouchableOpacity)`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const ExternalLinkText = styled.Text`
  color: ${color.gray60};
  font-family: ${font.pretendardMedium};
  font-size: 14px;
  text-decoration-line: underline;
`;
