import Clipboard from '@react-native-clipboard/clipboard';
import dayjs from 'dayjs';
import React from 'react';
import {Linking, Platform} from 'react-native';
import styled from 'styled-components/native';

import StoreAddressIcon from '@/assets/icon/ic_store_address_fill.svg';
import StoreInfoIcon from '@/assets/icon/ic_store_info_fill.svg';
import KakaoReviewIcon from '@/assets/icon/ic_review_kakao.svg';

import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  AccessibilityInfoV2Dto,
  Building,
  Place,
  PlaceDoorDirectionTypeDto,
  PlaceReviewDto,
  ToiletReviewDto,
} from '@/generated-sources/openapi';
import useNavigation from '@/navigation/useNavigation';

import ToastUtils from '@/utils/ToastUtils';

import AccessibilitySummarySection from '../sections/AccessibilitySummarySection';
import PlaceReviewSummaryInfo from '../../PlaceDetailScreen/components/PlaceReviewSummaryInfo';
import PlaceVisitReviewInfo from '../../PlaceDetailScreen/components/PlaceVisitReviewInfo';
import PlaceDetailPlaceToiletReviewItem from '../../PlaceDetailScreen/components/PlaceToiletReviewItem';
import {
  FloorInfoRow,
  StrokeCTAButton,
} from '../components/AccessibilityInfoComponents';
import {
  BuildingEntranceSection,
  BuildingEntranceEmptySection,
  PlaceEntranceSection,
  FloorMovementSection,
} from '../components/EntranceSection';
import IndoorInfoSection from '../components/IndoorInfoSection';

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
  onPressPlaceRegister: () => void;
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
  onPressReviewTab,
  onPressPlaceRegister,
  onPressReviewRegister,
  onPressToiletRegister,
}: Props) {
  const navigation = useNavigation();
  const hasAccessibility = !!accessibility?.placeAccessibility;
  const hasBuildingAccessibility = !!accessibility?.buildingAccessibility;

  // V2 건물유형 분기 필드
  const placeAcc = accessibility?.placeAccessibility;
  const isStandalone = placeAcc?.isStandaloneBuilding === true;
  const doorDir = placeAcc?.doorDirectionType;
  const floors = placeAcc?.floors ?? [];
  const isMultiFloor = floors.length > 1;
  const hasV2Fields = placeAcc?.isStandaloneBuilding != null && doorDir != null;
  const isInsideDoor = doorDir === PlaceDoorDirectionTypeDto.InsideBuilding;
  // "층간 이동 정보"는 여러층일 때만 표시
  const showFloorMovement = isMultiFloor;
  // "내부 이용 정보"는 단독건물이거나, 내부문이거나, 여러층일 때 표시 (V2 미적용 데이터는 항상 표시)
  const showIndoorInfo =
    !hasV2Fields || isStandalone || isInsideDoor || isMultiFloor;

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

  // ── 접근성 날짜 ──
  const buildingDate = accessibility?.buildingAccessibility
    ? dayjs(
        (accessibility.buildingAccessibility as any).createdAt?.value ??
          Date.now(),
      ).format('YYYY.MM.DD')
    : '';

  const placeDate = accessibility?.placeAccessibility
    ? dayjs(accessibility.placeAccessibility.createdAt.value).format(
        'YYYY.MM.DD',
      )
    : '';

  // ── 코멘트 ──
  const placeComments = accessibility?.placeAccessibilityComments ?? [];
  const buildingComments = accessibility?.buildingAccessibilityComments ?? [];

  return (
    <Container>
      {/* ── 1. 가게정보 섹션 ── */}
      <PlaceInfoSection>
        <PlaceInfoTitle>가게정보</PlaceInfoTitle>
        <PlaceInfoContent>
          {/* 주소 */}
          <PlaceInfoRow>
            <StoreAddressIcon width={20} height={20} color={color.gray30} />
            <AddressText>{place.address}</AddressText>
            <CopyButton elementName="v2_home_tab_copy_address" onPress={onCopy}>
              <CopyText>복사</CopyText>
            </CopyButton>
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
        </PlaceInfoContent>
      </PlaceInfoSection>

      {/* ── 2. AskBanner ── */}
      {!hasAccessibility && (
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
              disabled={isAccessibilityInfoRequested}>
              <RequestButtonText>
                {isAccessibilityInfoRequested ? '정보 요청됨' : '정보 요청하기'}
              </RequestButtonText>
            </RequestButton>
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
            <AccessibilitySummarySection
              accessibility={accessibility!}
              showLabel
            />

            {/* 층 정보 (항상 첫 번째) */}
            <FloorInfoRow accessibility={accessibility} />

            {hasV2Fields ? (
              <>
                {isStandalone ? (
                  <>
                    {/* 단독건물: 매장(건물 출입구) */}
                    <PlaceEntranceSection
                      title="매장(건물 출입구)"
                      placeDate={placeDate}
                      placeAccessibility={accessibility!.placeAccessibility!}
                      accessibility={accessibility}
                      placeComments={placeComments}
                      compact
                    />
                    {showFloorMovement && (
                      <FloorMovementSection
                        compact
                        placeAccessibility={accessibility?.placeAccessibility}
                      />
                    )}
                  </>
                ) : doorDir === PlaceDoorDirectionTypeDto.OutsideBuilding ? (
                  <>
                    {/* 비단독 + 외부문 */}
                    <PlaceEntranceSection
                      title="매장 출입구"
                      placeDate={placeDate}
                      placeAccessibility={accessibility!.placeAccessibility!}
                      accessibility={accessibility}
                      placeComments={placeComments}
                      compact
                    />
                    {showFloorMovement && (
                      <FloorMovementSection
                        compact
                        placeAccessibility={accessibility?.placeAccessibility}
                      />
                    )}
                  </>
                ) : (
                  <>
                    {/* 비단독 + 내부문 (INSIDE_BUILDING) */}
                    {hasBuildingAccessibility &&
                    accessibility?.buildingAccessibility ? (
                      <BuildingEntranceSection
                        buildingDate={buildingDate}
                        buildingAccessibility={
                          accessibility.buildingAccessibility
                        }
                        accessibility={accessibility}
                        buildingComments={buildingComments}
                        compact
                      />
                    ) : (
                      <BuildingEntranceEmptySection
                        compact
                        onRegister={onPressPlaceRegister}
                      />
                    )}
                    <PlaceEntranceSection
                      title="매장 출입구"
                      placeDate={placeDate}
                      placeAccessibility={accessibility!.placeAccessibility!}
                      accessibility={accessibility}
                      placeComments={placeComments}
                      compact
                    />
                    {showFloorMovement && (
                      <FloorMovementSection
                        compact
                        placeAccessibility={accessibility?.placeAccessibility}
                      />
                    )}
                  </>
                )}
              </>
            ) : (
              <>
                {/* Fallback: V2 필드 없는 기존 데이터 */}
                {hasBuildingAccessibility &&
                  accessibility?.buildingAccessibility && (
                    <BuildingEntranceSection
                      buildingDate={buildingDate}
                      buildingAccessibility={
                        accessibility.buildingAccessibility
                      }
                      accessibility={accessibility}
                      buildingComments={buildingComments}
                      compact
                    />
                  )}
                <PlaceEntranceSection
                  title="매장 출입구"
                  placeDate={placeDate}
                  placeAccessibility={accessibility!.placeAccessibility!}
                  accessibility={accessibility}
                  placeComments={placeComments}
                  compact
                />
              </>
            )}
          </AccessibilitySectionContainer>
        ) : (
          <EmptyCard>
            <EmptyCardTitle>
              {'아직 등록된 접근성 정보가 없어요🥲'}
            </EmptyCardTitle>
            <EmptyCardDescription>
              {'아래 버튼을 눌러주시면\n최대한 빨리 장소를 정복해볼게요!'}
            </EmptyCardDescription>
            <StrokeCTAButton
              text="정보 등록하기"
              onPress={onPressPlaceRegister}
              elementName="v2_home_tab_register_place"
              fullWidth
            />
          </EmptyCard>
        )}
      </Section>

      {/* ── 4. Thick Divider ── */}
      <ThickDivider />

      {/* ── 5. 내부공간 섹션 (V2: 단독건물/내부문/여러층일 때만 표시) ── */}
      {showIndoorInfo && (
        <>
          <Section>
            <IndoorInfoSection
              reviews={reviews}
              title="내부공간"
              showDate={false}
              onRegister={onPressReviewRegister}
            />
          </Section>

          {/* ── 6. Thick Divider ── */}
          <ThickDivider />
        </>
      )}

      {/* ── 7. 방문 리뷰 섹션 ── */}
      <Section>
        <SectionHeader>
          <SectionTitle>방문 리뷰</SectionTitle>
          {reviews.length > 0 && (
            <MoreButton
              elementName="v2_home_tab_review_more"
              onPress={onPressReviewTab}
              accessibilityLabel="리뷰 탭으로 이동">
              <MoreText>전체 {reviews.length}건</MoreText>
            </MoreButton>
          )}
        </SectionHeader>
        {reviews.length > 0 ? (
          <>
            <PlaceReviewSummaryInfo
              reviews={reviews}
              placeId={place.id}
              placeName={place.name}
              placeLocation={place.location}
              placeAddress={place.address}
            />
            <PlaceVisitReviewInfo reviews={reviews} placeId={place.id} />
          </>
        ) : (
          <EmptyCard>
            <EmptyCardTitle>
              {'아직 등록된 방문 리뷰가 없어요🥲'}
            </EmptyCardTitle>
            <EmptyCardDescription>
              {
                '장소 내부 리뷰는 공간 이용 여부를\n결정할 수 있는 중요한 정보에요!'
              }
            </EmptyCardDescription>
            <StrokeCTAButton
              text="내부 리뷰 작성하기"
              onPress={onPressReviewRegister}
              elementName="v2_home_tab_register_review"
              fullWidth
            />
          </EmptyCard>
        )}
      </Section>

      {/* ── 8. Thick Divider ── */}
      <ThickDivider />

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
          <EmptyCard>
            <EmptyCardTitle>
              {'아직 등록된 화장실 정보가 없어요🥲'}
            </EmptyCardTitle>
            <EmptyCardDescription>
              {
                '장애인 화장실이 있었나요?\n정보를 등록해주시면 필요한 분들에게 큰 도움이 돼요.'
              }
            </EmptyCardDescription>
            <StrokeCTAButton
              text="장애인 화장실 정보 등록"
              onPress={onPressToiletRegister}
              elementName="v2_home_tab_register_toilet"
              fullWidth
            />
          </EmptyCard>
        )}
      </Section>

      {/* ── 10. Bottom Padding ── */}
      <BottomPadding />
    </Container>
  );
}

// ──────────────── Helpers ────────────────

function formatConquerorText(accessibility?: AccessibilityInfoV2Dto): string {
  const names: string[] = [];
  if (accessibility?.placeAccessibility?.registeredUserName) {
    names.push(accessibility.placeAccessibility.registeredUserName);
  }
  if (accessibility?.buildingAccessibility?.registeredUserName) {
    const buildingName = accessibility.buildingAccessibility.registeredUserName;
    if (!names.includes(buildingName)) {
      names.push(buildingName);
    }
  }

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

/* Bottom Padding */
const BottomPadding = styled.View`
  height: 100px;
`;
