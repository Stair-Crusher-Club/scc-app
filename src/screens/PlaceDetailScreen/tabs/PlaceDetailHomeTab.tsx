import Clipboard from '@react-native-clipboard/clipboard';
import React from 'react';
import {Linking, Platform, View} from 'react-native';
import styled from 'styled-components/native';

import ClockIcon from '@/assets/icon/ic_clock.svg';
import PlaceIcon from '@/assets/icon/ic_place.svg';
import PlusIcon from '@/assets/icon/ic_plus.svg';
import ReviewOutlineIcon from '@/assets/icon/ic_review_outline.svg';

import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  AccessibilityInfoV2Dto,
  Place,
  PlaceReviewDto,
} from '@/generated-sources/openapi';
import useNavigation from '@/navigation/useNavigation';
import ToastUtils from '@/utils/ToastUtils';

import PlaceFloorInfo from '../components/PlaceFloorInfo';
import PlaceEntranceStepInfo from '../components/PlaceEntranceStepInfo';
import PlaceDoorInfo from '../components/PlaceDoorInfo';
import PlaceReviewItem from '../components/PlaceReviewItem';
import AccessibilitySummarySection from '../sections/AccessibilitySummarySection';

interface Props {
  accessibility?: AccessibilityInfoV2Dto;
  place: Place;
  reviews: PlaceReviewDto[];
  kakaoPlaceId?: string;
  isAccessibilityInfoRequested?: boolean;
  onRequestInfo: () => void;
  onPressAccessibilityTab: () => void;
  onPressReviewTab: () => void;
  onPressPlaceRegister: () => void;
  onPressReviewRegister: () => void;
}

export default function PlaceDetailHomeTab({
  accessibility,
  place,
  reviews,
  kakaoPlaceId,
  isAccessibilityInfoRequested,
  onRequestInfo,
  onPressAccessibilityTab,
  onPressReviewTab,
  onPressPlaceRegister,
  onPressReviewRegister,
}: Props) {
  const navigation = useNavigation();
  const hasAccessibility = !!accessibility?.placeAccessibility;
  const firstReview = reviews.length > 0 ? reviews[0] : null;

  const onCopy = () => {
    Clipboard.setString(place.address);
    ToastUtils.show('주소가 복사되었습니다.');
  };

  const getExternalUrl = (hash: string) => {
    if (kakaoPlaceId) {
      return `https://place.map.kakao.com/${kakaoPlaceId}#${hash}`;
    }
    const searchQuery = encodeURIComponent(`${place.name} ${place.address}`);
    return `https://map.naver.com/p/search/${searchQuery}`;
  };

  const onOpenBusinessHours = async () => {
    const url = getExternalUrl('home');
    if (Platform.OS === 'web') {
      await Linking.openURL(url);
      return;
    }
    navigation.navigate('Webview', {url, headerVariant: 'navigation'});
  };

  const onOpenKakaoReview = async () => {
    const url = getExternalUrl('review');
    if (Platform.OS === 'web') {
      await Linking.openURL(url);
      return;
    }
    navigation.navigate('Webview', {url, headerVariant: 'navigation'});
  };

  return (
    <Container>
      {/* 1. 가게정보 섹션 */}
      <PlaceInfoSection>
        <PlaceInfoTitle>가게정보</PlaceInfoTitle>
        <PlaceInfoContent>
          {/* 주소 */}
          <InfoRow>
            <PlaceIcon width={20} height={20} color={color.gray70} />
            <AddressText>{place.address}</AddressText>
            <CopyButton
              elementName="place_detail_home_tab_copy_address"
              onPress={onCopy}>
              <CopyText>복사</CopyText>
            </CopyButton>
          </InfoRow>

          {/* 영업시간 및 메뉴 */}
          <InfoRow>
            <ClockIcon width={20} height={20} color={color.gray70} />
            <ExternalLinkButton
              elementName="place_detail_home_tab_business_hours"
              onPress={onOpenBusinessHours}>
              <ExternalLinkText>영업시간 및 메뉴</ExternalLinkText>
            </ExternalLinkButton>
          </InfoRow>

          {/* 카카오 리뷰 */}
          <InfoRow>
            <ReviewOutlineIcon width={20} height={20} color={color.gray70} />
            <ExternalLinkButton
              elementName="place_detail_home_tab_kakao_review"
              onPress={onOpenKakaoReview}>
              <ExternalLinkText>카카오 리뷰</ExternalLinkText>
            </ExternalLinkButton>
          </InfoRow>
        </PlaceInfoContent>
      </PlaceInfoSection>

      {/* 2. AskBanner (접근성 정보 요청) - 접근성 정보 없을 때만 */}
      {!hasAccessibility && (
        <AskBannerContainer>
          <AskBannerInner>
            <AskBannerText>
              {
                '이곳의 접근성이 궁금하시면\n버튼을 눌러서 접근성 정보를 요청해주세요!'
              }
            </AskBannerText>
            <RequestButton
              elementName="place_detail_home_tab_request_info"
              onPress={onRequestInfo}
              disabled={isAccessibilityInfoRequested}>
              <RequestButtonText>
                {isAccessibilityInfoRequested ? '정보 요청됨' : '정보 요청하기'}
              </RequestButtonText>
            </RequestButton>
          </AskBannerInner>
        </AskBannerContainer>
      )}

      {/* 3. 접근성 섹션 */}
      <Section>
        <SectionHeader>
          <SectionTitle>접근성</SectionTitle>
          {hasAccessibility && (
            <MoreButton
              elementName="place_detail_home_tab_accessibility_more"
              onPress={onPressAccessibilityTab}
              accessibilityLabel="접근성 탭으로 이동">
              <MoreText>더보기</MoreText>
            </MoreButton>
          )}
        </SectionHeader>
        {hasAccessibility ? (
          <>
            <AccessibilitySummarySection accessibility={accessibility!} />
            <AccessibilitySummaryContainer>
              <PlaceFloorInfo accessibility={accessibility} />
              <PlaceEntranceStepInfo accessibility={accessibility} />
              <PlaceDoorInfo accessibility={accessibility} />
            </AccessibilitySummaryContainer>
          </>
        ) : (
          <EmptyCard>
            <EmptyCardTitle>
              {'아직 등록된  접근성 정보가 없어요🥲'}
            </EmptyCardTitle>
            <EmptyCardDescription>
              {'아래 버튼을 눌러주시면\n최대한 빨리 장소를 정복해볼게요!'}
            </EmptyCardDescription>
            <CTAButton
              elementName="place_detail_home_tab_register_place"
              onPress={onPressPlaceRegister}>
              <CTAButtonContent>
                <PlusIcon width={20} height={20} color={color.brand40} />
                <CTAButtonText>정보 등록하기</CTAButtonText>
              </CTAButtonContent>
            </CTAButton>
          </EmptyCard>
        )}
      </Section>

      {/* 4. 6px 디바이더 */}
      <ThickDivider />

      {/* 5. 방문 리뷰 섹션 */}
      <Section>
        <SectionHeader>
          <ReviewSectionTitle>방문 리뷰</ReviewSectionTitle>
          {reviews.length > 0 && (
            <MoreButton
              elementName="place_detail_home_tab_review_more"
              onPress={onPressReviewTab}
              accessibilityLabel="리뷰 탭으로 이동">
              <MoreText>전체 {reviews.length}건</MoreText>
            </MoreButton>
          )}
        </SectionHeader>
        {firstReview ? (
          <View>
            <PlaceReviewItem placeId={place.id} review={firstReview} />
          </View>
        ) : (
          <EmptyCard>
            <EmptyCardTitle>
              {'아직 등록된  방문 리뷰가 없어요🥲'}
            </EmptyCardTitle>
            <EmptyCardDescription>
              {
                '장소 내부 리뷰는 공간 이용 여부를\n결정할 수 있는 중요한 정보에요!'
              }
            </EmptyCardDescription>
            <CTAButton
              elementName="place_detail_home_tab_register_review"
              onPress={onPressReviewRegister}>
              <CTAButtonContent>
                <PlusIcon width={20} height={20} color={color.brand40} />
                <CTAButtonText>내부 리뷰 작성하기</CTAButtonText>
              </CTAButtonContent>
            </CTAButton>
          </EmptyCard>
        )}
      </Section>
    </Container>
  );
}

/* ─── Styled Components ─── */

const Container = styled.View`
  background-color: ${color.white};
  padding-bottom: 100px;
`;

/* 1. 가게정보 섹션 */
const PlaceInfoSection = styled.View`
  padding: 20px;
  gap: 16px;
`;

const PlaceInfoTitle = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -0.32px;
  color: ${color.black};
`;

const PlaceInfoContent = styled.View`
  gap: 10px;
`;

const InfoRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const AddressText = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.28px;
  color: ${color.gray70};
  flex-shrink: 1;
`;

const CopyButton = styled(SccTouchableOpacity)`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const CopyText = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 12px;
  line-height: 16px;
  letter-spacing: -0.24px;
  color: ${color.brand50};
`;

const ExternalLinkButton = styled(SccTouchableOpacity)``;

const ExternalLinkText = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.28px;
  color: ${color.gray70};
  text-decoration-line: underline;
`;

/* 2. AskBanner */
const AskBannerContainer = styled.View`
  padding-vertical: 20px;
`;

const AskBannerInner = styled.View`
  background-color: ${color.gray15};
  padding: 20px;
  overflow: hidden;
  gap: 12px;
`;

const AskBannerText = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 14px;
  line-height: 22px;
  letter-spacing: -0.28px;
  color: ${color.black};
`;

const RequestButton = styled(SccTouchableOpacity)`
  background-color: ${color.brand40};
  border-radius: 100px;
  padding-horizontal: 16px;
  padding-vertical: 6px;
  align-self: flex-start;
`;

const RequestButtonText = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 12px;
  line-height: 16px;
  letter-spacing: -0.24px;
  color: ${color.white};
`;

/* 3 & 5. Section common */
const Section = styled.View`
  padding: 20px;
  gap: 16px;
`;

const SectionHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const SectionTitle = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 18px;
  line-height: 26px;
  letter-spacing: -0.36px;
  color: ${color.black};
`;

const ReviewSectionTitle = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 18px;
  line-height: 26px;
  letter-spacing: -0.36px;
  color: ${color.gray90};
`;

const MoreButton = styled(SccTouchableOpacity)`
  padding: 4px 0px;
`;

const MoreText = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 14px;
  letter-spacing: -0.28px;
  color: ${color.brand50};
`;

/* Empty Card */
const EmptyCard = styled.View`
  background-color: ${color.gray5};
  border-radius: 12px;
  padding: 20px;
  gap: 16px;
  align-items: center;
`;

const EmptyCardTitle = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 18px;
  line-height: 26px;
  letter-spacing: -0.36px;
  color: ${color.gray80};
  text-align: center;
`;

const EmptyCardDescription = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 15px;
  line-height: 24px;
  letter-spacing: -0.3px;
  color: #767884;
  text-align: center;
`;

const CTAButton = styled(SccTouchableOpacity)`
  background-color: ${color.white};
  border-width: 1px;
  border-color: ${color.brand40};
  border-radius: 8px;
  padding-vertical: 12px;
  padding-horizontal: 28px;
  width: 100%;
`;

const CTAButtonContent = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 6px;
`;

const CTAButtonText = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -0.32px;
  color: ${color.brand40};
`;

/* Accessibility populated */
const AccessibilitySummaryContainer = styled.View`
  gap: 20px;
`;

/* 4. Thick Divider */
const ThickDivider = styled.View`
  height: 6px;
  background-color: ${color.gray5};
`;
