import Clipboard from '@react-native-clipboard/clipboard';
import dayjs from 'dayjs';
import React from 'react';
import {Image, Linking, Platform} from 'react-native';
import styled from 'styled-components/native';

import StoreAddressIcon from '@/assets/icon/ic_store_address_fill.svg';
import StoreInfoIcon from '@/assets/icon/ic_store_info_fill.svg';
import KakaoReviewIcon from '@/assets/icon/ic_review_kakao.svg';
import RouteFillIcon from '@/assets/icon/ic_route_fill.svg';

import {isInfoRequestEligible} from '@/components/AccessibilityInfoRequestButton';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  AccessibilityInfoV2Dto,
  Building,
  Place,
  PlaceReviewDto,
  ToiletReviewDto,
} from '@/generated-sources/openapi';
import useNavigation from '@/navigation/useNavigation';

import ToastUtils from '@/utils/ToastUtils';

import PlaceReviewSummaryInfo from '../../PlaceDetailScreen/components/PlaceReviewSummaryInfo';
import PlaceDetailPlaceToiletReviewItem from '../../PlaceDetailScreen/components/PlaceToiletReviewItem';
import {
  EmptyStateCard,
  FloorInfoRow,
} from '../components/AccessibilityInfoComponents';
import {
  BuildingEntranceSection,
  BuildingEntranceEmptySection,
  PlaceEntranceSection,
  FloorMovementSection,
} from '../components/EntranceSection';
import {getAccessibilitySections} from '../components/PlaceInfo.utils';

interface Props {
  accessibility?: AccessibilityInfoV2Dto;
  place: Place;
  building: Building;
  reviews: PlaceReviewDto[];
  toiletReviews: ToiletReviewDto[];
  kakaoPlaceId?: string;
  isAccessibilityInfoRequested?: boolean;
  isAccessibilityRegistrable?: boolean;
  onRequestInfo: () => void;
  onPressAccessibilityTab: () => void;
  onPressReviewTab: () => void;
  onPressDirections: () => void;
  onPressPlaceRegister: () => void;
  onPressBuildingRegister: () => void;
  onPressReviewRegister: () => void;
  onPressToiletRegister: () => void;
}

export default function V2HomeTab({
  accessibility,
  place,
  building: _building,
  reviews,
  toiletReviews,
  kakaoPlaceId,
  isAccessibilityInfoRequested,
  isAccessibilityRegistrable: _isAccessibilityRegistrable,
  onRequestInfo,
  onPressAccessibilityTab: _onPressAccessibilityTab,
  onPressReviewTab: _onPressReviewTab,
  onPressDirections,
  onPressPlaceRegister,
  onPressBuildingRegister,
  onPressReviewRegister: _onPressReviewRegister,
  onPressToiletRegister,
}: Props) {
  const navigation = useNavigation();

  // 다중 출입구 배열 지원 (하위 호환: 단일 필드 fallback)
  const placeAccessibilities =
    accessibility?.placeAccessibilities ??
    (accessibility?.placeAccessibility
      ? [accessibility.placeAccessibility]
      : []);
  const buildingAccessibilities =
    accessibility?.buildingAccessibilities ??
    (accessibility?.buildingAccessibility
      ? [accessibility.buildingAccessibility]
      : []);

  const hasAccessibility = placeAccessibilities.length > 0;
  const hasBuildingAccessibility = buildingAccessibilities.length > 0;

  // V2 건물유형 분기 필드 (첫 번째 PA 기준)
  const placeAcc = placeAccessibilities[0];
  const isStandalone = placeAcc?.isStandaloneBuilding === true;
  const doorDir = placeAcc?.doorDirectionType;
  const floors = placeAcc?.floors ?? [];
  const isMultiFloor = floors.length > 1;
  const hasV2Fields = placeAcc?.isStandaloneBuilding != null && doorDir != null;

  // 섹션 순서/가시성을 공유 유틸리티로 결정 (홈탭에서는 '내부 이용 정보' 제외)
  const sections = getAccessibilitySections({
    isStandalone,
    doorDir,
    isMultiFloor,
    hasV2Fields,
    hasBuildingAccessibility,
  });

  // 접근성 데이터에서 첫 번째 challengeCrusherGroup 추출
  const challengeCrusherGroup =
    placeAccessibilities.find(pa => pa.challengeCrusherGroup)
      ?.challengeCrusherGroup ??
    buildingAccessibilities.find(ba => ba.challengeCrusherGroup)
      ?.challengeCrusherGroup;

  // ── 가게정보 helpers ──
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

  // ── 접근성 날짜는 각 출입구별로 계산 (렌더링 시 인라인) ──

  return (
    <Container>
      {/* ── 1. 가게정보 섹션 ── */}
      <PlaceInfoSection>
        <PlaceInfoTitle>가게정보</PlaceInfoTitle>
        <PlaceInfoContent>
          {/* 주소 */}
          <PlaceInfoRow>
            <StoreAddressIcon width={20} height={20} color={color.gray30} />
            <AddressCopyWrapper>
              <AddressText>{place.address}</AddressText>
              <CopyButton
                elementName="v2_home_tab_copy_address"
                onPress={onCopy}>
                <CopyText>복사</CopyText>
              </CopyButton>
            </AddressCopyWrapper>
          </PlaceInfoRow>

          {/* 영업시간 및 메뉴 */}
          <PlaceInfoRow>
            <StoreInfoIcon width={20} height={20} color={color.gray30} />
            <ExternalLinkButton
              elementName="v2_home_tab_business_hours"
              onPress={onOpenBusinessHours}>
              <ExternalLinkText>영업시간 및 메뉴</ExternalLinkText>
            </ExternalLinkButton>
          </PlaceInfoRow>

          {/* 카카오 리뷰 */}
          <PlaceInfoRow>
            <KakaoReviewIcon width={20} height={20} color={color.gray30} />
            <ExternalLinkButton
              elementName="v2_home_tab_kakao_review"
              onPress={onOpenKakaoReview}>
              <ExternalLinkText>카카오 리뷰</ExternalLinkText>
            </ExternalLinkButton>
          </PlaceInfoRow>

          {/* 길찾기 */}
          <PlaceInfoRow>
            <RouteFillIcon width={20} height={20} color={color.gray30} />
            <ExternalLinkButton
              elementName="v2_home_tab_directions"
              onPress={onPressDirections}>
              <ExternalLinkText>길찾기</ExternalLinkText>
            </ExternalLinkButton>
          </PlaceInfoRow>
        </PlaceInfoContent>
      </PlaceInfoSection>

      {/* ── 2. AskBanner ── */}
      {isInfoRequestEligible({
        hasPlaceAccessibility: hasAccessibility,
        address: place.address,
        category: place.category,
      }) && (
        <AskBannerContainer>
          <AskBannerInner>
            <AskBannerText>
              {
                '이곳의 접근성이 궁금하시면\n버튼을 눌러서 접근성 정보를 요청해주세요!'
              }
            </AskBannerText>
            <RequestButton
              elementName="v2_home_tab_request_info"
              onPress={onRequestInfo}
              isRequested={isAccessibilityInfoRequested}>
              <RequestButtonText isRequested={isAccessibilityInfoRequested}>
                {isAccessibilityInfoRequested
                  ? '정보 요청 완료!'
                  : '정보 요청하기'}
              </RequestButtonText>
            </RequestButton>
            <AskBannerImage
              source={require('@/assets/img/img_request_info_banner.png')}
            />
          </AskBannerInner>
        </AskBannerContainer>
      )}

      {/* ── 3. 접근성 섹션 ── */}
      <Section>
        <SectionHeader>
          <SectionTitle>접근성</SectionTitle>
          {hasAccessibility && (
            <ConquerorText>{formatConquerorText(accessibility)}</ConquerorText>
          )}
        </SectionHeader>
        {hasAccessibility ? (
          <AccessibilitySectionContainer>
            {sections.map(section => {
              switch (section) {
                case '층 정보':
                  return (
                    <FloorInfoRow key={section} accessibility={accessibility} />
                  );
                case '건물 출입구':
                  return (
                    <React.Fragment key={section}>
                      {hasBuildingAccessibility ? (
                        buildingAccessibilities.map((ba, index) => (
                          <BuildingEntranceSection
                            key={ba.id ?? index}
                            buildingDate={dayjs(
                              (ba as any).createdAt?.value ?? Date.now(),
                            ).format('YYYY.MM.DD')}
                            buildingAccessibility={ba}
                            title={
                              buildingAccessibilities.length > 1
                                ? `건물 출입구 (${index + 1})`
                                : '건물 출입구'
                            }
                            compact
                          />
                        ))
                      ) : (
                        <BuildingEntranceEmptySection
                          compact
                          onRegister={onPressBuildingRegister}
                        />
                      )}
                    </React.Fragment>
                  );
                case '매장 출입구':
                  return placeAccessibilities.length > 0 ? (
                    <PlaceEntranceSection
                      key={section}
                      title={'매장 출입구'}
                      placeDate={dayjs(
                        placeAccessibilities[0].createdAt.value,
                      ).format('YYYY.MM.DD')}
                      placeAccessibility={placeAccessibilities[0]}
                      compact
                    />
                  ) : null;
                case '층간 이동 정보':
                  return (
                    <FloorMovementSection
                      key={section}
                      compact
                      placeAccessibility={placeAcc}
                    />
                  );
                case '내부 이용 정보':
                  return null; // 홈탭에서는 제외
                default:
                  return null;
              }
            })}
          </AccessibilitySectionContainer>
        ) : (
          <EmptyStateCard
            title={'아직 등록된 접근성 정보가 없어요🥲'}
            description={
              '아래 버튼을 눌러주시면\n최대한 빨리 장소를 정복해볼게요!'
            }
            buttonText="정보 등록하기"
            onPress={onPressPlaceRegister}
            elementName="v2_home_tab_register_place"
          />
        )}
      </Section>

      {/* ── 4. B2B Label or Thick Divider ── */}
      {challengeCrusherGroup ? (
        <B2BLabelBanner>
          {challengeCrusherGroup.icon && (
            <B2BBannerIcon
              source={{uri: challengeCrusherGroup.icon.imageUrl}}
              resizeMode="contain"
            />
          )}
          <B2BBannerText>이 계단뿌셔클럽과 함께했어요.</B2BBannerText>
        </B2BLabelBanner>
      ) : (
        <ThickDivider />
      )}

      {/* ── 5. 방문 리뷰 섹션 (통계만 표시, 0건이면 숨김) ── */}
      {reviews.length > 0 && (
        <>
          <Section>
            <SectionHeader>
              <SectionTitle>방문 리뷰</SectionTitle>
            </SectionHeader>
            <PlaceReviewSummaryInfo
              reviews={reviews}
              placeId={place.id}
              placeName={place.name}
              placeLocation={place.location}
              placeAddress={place.address}
              hideWriteButton
            />
          </Section>

          <ThickDivider />
        </>
      )}

      {/* ── 9. 화장실 섹션 ── */}
      <Section>
        <SectionHeader>
          <SectionTitle>화장실</SectionTitle>
        </SectionHeader>
        {toiletReviews.length > 0 ? (
          <ToiletReviewList>
            {toiletReviews.map((review, idx) => (
              <React.Fragment key={review.id}>
                <PlaceDetailPlaceToiletReviewItem
                  placeId={place.id}
                  review={review}
                />
                {idx !== toiletReviews.length - 1 && <ToiletDivider />}
              </React.Fragment>
            ))}
          </ToiletReviewList>
        ) : (
          <EmptyStateCard
            title={'아직 등록된 화장실 정보가 없어요🥲'}
            description={
              '장애인 화장실이 있었나요?\n정보를 등록해주시면 필요한 분들에게 큰 도움이 돼요.'
            }
            buttonText="장애인 화장실 정보 등록"
            onPress={onPressToiletRegister}
            elementName="v2_home_tab_register_toilet"
          />
        )}
      </Section>
    </Container>
  );
}

// ──────────────── Helpers ────────────────

function formatConquerorText(accessibility?: AccessibilityInfoV2Dto): string {
  const nameSet = new Set<string>();

  const placeItems = accessibility?.placeAccessibilities?.length
    ? accessibility.placeAccessibilities
    : accessibility?.placeAccessibility
      ? [accessibility.placeAccessibility]
      : [];
  for (const pa of placeItems) {
    if (pa.registeredUserName) {
      nameSet.add(pa.registeredUserName);
    }
  }

  const buildingItems = accessibility?.buildingAccessibilities?.length
    ? accessibility.buildingAccessibilities
    : accessibility?.buildingAccessibility
      ? [accessibility.buildingAccessibility]
      : [];
  for (const ba of buildingItems) {
    if (ba.registeredUserName) {
      nameSet.add(ba.registeredUserName);
    }
  }

  const names = Array.from(nameSet);
  if (names.length === 0) {
    return '정복자 익명 비밀요원';
  }
  if (names.length === 1) {
    return `정복자 ${names[0]}`;
  }
  return `정복자 ${names[0]} 외 ${names.length - 1}명`;
}

// ──────────────── Styled Components ────────────────

const Container = styled.View`
  background-color: ${color.white};
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

const PlaceInfoRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const AddressCopyWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  flex-shrink: 1;
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

const RequestButton = styled(SccTouchableOpacity)<{isRequested?: boolean}>`
  background-color: ${({isRequested}) =>
    isRequested ? color.gray25 : color.brand40};
  border-radius: 100px;
  padding-horizontal: 16px;
  padding-vertical: 6px;
  align-self: flex-start;
`;

const RequestButtonText = styled.Text<{isRequested?: boolean}>`
  font-family: ${font.pretendardMedium};
  font-size: 12px;
  line-height: 16px;
  letter-spacing: -0.24px;
  color: ${({isRequested}) => (isRequested ? '#3A3C45' : color.white)};
`;

const AskBannerImage = styled(Image)`
  position: absolute;
  right: 20px;
  top: 4px;
  width: 90px;
  height: 116px;
  resize-mode: contain;
`;

/* Section common */
const Section = styled.View`
  padding: 20px;
  gap: 16px;
`;

const SectionHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const AccessibilitySectionContainer = styled.View`
  flex-direction: column;
  gap: 40px;
`;

const SectionTitle = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 18px;
  line-height: 26px;
  letter-spacing: -0.36px;
  color: ${color.gray90};
`;

const ConquerorText = styled.Text`
  flex: 1;
  font-family: ${font.pretendardRegular};
  font-size: 12px;
  line-height: 16px;
  letter-spacing: -0.24px;
  color: #767884;
  text-align: right;
`;

/* Toilet reviews */
const ToiletReviewList = styled.View`
  gap: 20px;
`;

const ToiletDivider = styled.View`
  height: 1px;
  background-color: ${color.gray20};
`;

/* Thick Divider */
const ThickDivider = styled.View`
  height: 6px;
  background-color: ${color.gray5};
`;

/* B2B Label Banner */
const B2BLabelBanner = styled.View`
  background-color: ${color.gray15};
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding-vertical: 8px;
  padding-horizontal: 10px;
`;

const B2BBannerIcon = styled(Image)`
  height: 28px;
  aspect-ratio: 74 / 28;
`;

const B2BBannerText = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 14px;
  line-height: 22.4px;
  letter-spacing: -0.07px;
  color: #6a6a73;
`;
