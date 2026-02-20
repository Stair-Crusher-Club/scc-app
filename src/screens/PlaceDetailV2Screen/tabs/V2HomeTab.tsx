import Clipboard from '@react-native-clipboard/clipboard';
import dayjs from 'dayjs';
import React from 'react';
import {Image, Linking, Platform} from 'react-native';
import styled from 'styled-components/native';

import StoreAddressIcon from '@/assets/icon/ic_store_address_fill.svg';
import StoreInfoIcon from '@/assets/icon/ic_store_info_fill.svg';
import PlusIcon from '@/assets/icon/ic_plus.svg';
import KakaoReviewIcon from '@/assets/icon/ic_review_kakao.svg';

import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {doorTypeMap} from '@/constant/options';
import {
  AccessibilityInfoV2Dto,
  Building,
  BuildingDoorDirectionTypeDto,
  Place,
  PlaceDoorDirectionTypeDto,
  PlaceReviewDto,
  ToiletReviewDto,
} from '@/generated-sources/openapi';
import useNavigation from '@/navigation/useNavigation';
import {SEAT_TYPE_OPTIONS} from '@/screens/PlaceReviewFormScreen/constants';
import ToastUtils from '@/utils/ToastUtils';

import AccessibilitySummarySection from '../sections/AccessibilitySummarySection';
import PlaceReviewSummaryInfo from '../../PlaceDetailScreen/components/PlaceReviewSummaryInfo';
import PlaceVisitReviewInfo from '../../PlaceDetailScreen/components/PlaceVisitReviewInfo';
import PlaceDetailPlaceToiletReviewItem from '../../PlaceDetailScreen/components/PlaceToiletReviewItem';
import {
  getFloorAccessibility,
  getPlaceEntranceStepType,
  getBuildingEntranceStepType,
  getBuildingElevatorType,
  getStairDescription,
  EntranceStepType,
  ElevatorType,
} from '../components/PlaceInfo.utils';

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

  // ── 내부공간 데이터 ──
  const allSeatTypes = [...new Set(reviews.flatMap(r => r.seatTypes))];
  const seatTypes = allSeatTypes.filter(item =>
    SEAT_TYPE_OPTIONS.includes(item),
  );
  const seatComments = allSeatTypes.filter(
    item => !SEAT_TYPE_OPTIONS.includes(item),
  );
  const orderMethods = [...new Set(reviews.flatMap(r => r.orderMethods))];
  const features = [...new Set(reviews.flatMap(r => r.features))];
  const hasIndoorData =
    seatTypes.length > 0 || orderMethods.length > 0 || features.length > 0;

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
          <SectionContainer>
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
                    <HomeStoreSectionBlock
                      title="매장(건물 출입구)"
                      placeDate={placeDate}
                      accessibility={accessibility}
                    />
                    {showFloorMovement && <HomeFloorMovementBlock />}
                  </>
                ) : doorDir === PlaceDoorDirectionTypeDto.OutsideBuilding ? (
                  <>
                    {/* 비단독 + 외부문 */}
                    <HomeStoreSectionBlock
                      title="매장 출입구"
                      placeDate={placeDate}
                      accessibility={accessibility}
                    />
                    {showFloorMovement && <HomeFloorMovementBlock />}
                  </>
                ) : (
                  <>
                    {/* 비단독 + 내부문 (INSIDE_BUILDING) */}
                    {hasBuildingAccessibility &&
                      accessibility?.buildingAccessibility && (
                        <HomeBuildingSectionBlock
                          buildingDate={buildingDate}
                          accessibility={accessibility}
                        />
                      )}
                    <HomeStoreSectionBlock
                      title="매장 출입구"
                      placeDate={placeDate}
                      accessibility={accessibility}
                    />
                    {showFloorMovement && <HomeFloorMovementBlock />}
                  </>
                )}
              </>
            ) : (
              <>
                {/* Fallback: V2 필드 없는 기존 데이터 */}
                {hasBuildingAccessibility &&
                  accessibility?.buildingAccessibility && (
                    <HomeBuildingSectionBlock
                      buildingDate={buildingDate}
                      accessibility={accessibility}
                    />
                  )}
                <HomeStoreSectionBlock
                  title="매장 출입구"
                  placeDate={placeDate}
                  accessibility={accessibility}
                />
              </>
            )}
          </SectionContainer>
        ) : (
          <EmptyCard>
            <EmptyCardTitle>
              {'아직 등록된 접근성 정보가 없어요🥲'}
            </EmptyCardTitle>
            <EmptyCardDescription>
              {'아래 버튼을 눌러주시면\n최대한 빨리 장소를 정복해볼게요!'}
            </EmptyCardDescription>
            <CTAButton
              elementName="v2_home_tab_register_place"
              onPress={onPressPlaceRegister}>
              <CTAButtonContent>
                <PlusIcon width={20} height={20} color={color.brand40} />
                <CTAButtonText>정보 등록하기</CTAButtonText>
              </CTAButtonContent>
            </CTAButton>
          </EmptyCard>
        )}
      </Section>

      {/* ── 4. Thick Divider ── */}
      <ThickDivider />

      {/* ── 5. 내부공간 섹션 (V2: 단독건물/내부문/여러층일 때만 표시) ── */}
      {hasIndoorData && showIndoorInfo && (
        <>
          <Section>
            <SectionHeader>
              <SectionTitle>내부공간</SectionTitle>
            </SectionHeader>

            <IndoorContent>
              {seatTypes.length > 0 && (
                <IndoorRow>
                  <IndoorLabel>좌석 구성</IndoorLabel>
                  <IndoorValueContainer>
                    <TagWrap>
                      {seatTypes.map(t => (
                        <Tag key={t}>
                          <TagText>{t}</TagText>
                        </Tag>
                      ))}
                    </TagWrap>
                    {seatComments.length > 0 && (
                      <IndoorDescription>
                        {seatComments.join(', ')}
                      </IndoorDescription>
                    )}
                  </IndoorValueContainer>
                </IndoorRow>
              )}

              {orderMethods.length > 0 && (
                <IndoorRow>
                  <IndoorLabel>주문방법</IndoorLabel>
                  <IndoorValueContainer>
                    <TagWrap>
                      {orderMethods.map(m => (
                        <Tag key={m}>
                          <TagText>{m}</TagText>
                        </Tag>
                      ))}
                    </TagWrap>
                  </IndoorValueContainer>
                </IndoorRow>
              )}

              {features.length > 0 && (
                <IndoorRow>
                  <IndoorLabel>특이사항</IndoorLabel>
                  <IndoorValueContainer>
                    <IndoorFeatureText>{features.join(', ')}</IndoorFeatureText>
                  </IndoorValueContainer>
                </IndoorRow>
              )}
            </IndoorContent>
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
            <CTAButton
              elementName="v2_home_tab_register_review"
              onPress={onPressReviewRegister}>
              <CTAButtonContent>
                <PlusIcon width={20} height={20} color={color.brand40} />
                <CTAButtonText>내부 리뷰 작성하기</CTAButtonText>
              </CTAButtonContent>
            </CTAButton>
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
            <CTAButton
              elementName="v2_home_tab_register_toilet"
              onPress={onPressToiletRegister}>
              <CTAButtonContent>
                <PlusIcon width={20} height={20} color={color.brand40} />
                <CTAButtonText>장애인 화장실 정보 등록</CTAButtonText>
              </CTAButtonContent>
            </CTAButton>
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

// ──────────────── Sub-components ────────────────

function InfoRow({
  label,
  value,
  subValue,
}: {
  label: string;
  value: string;
  subValue?: string;
}) {
  return (
    <InfoRowContainer>
      <InfoLabel>{label}</InfoLabel>
      <InfoValueContainer>
        <InfoValue>{value}</InfoValue>
        {subValue ? <InfoSubValue>{subValue}</InfoSubValue> : null}
      </InfoValueContainer>
    </InfoRowContainer>
  );
}

function PhotoRow({images}: {images: Array<{imageUrl: string}>}) {
  if (images.length === 0) {
    return null;
  }
  return (
    <PhotoRowContainer>
      {images.slice(0, 3).map((img, index) => (
        <PhotoThumbnail key={index} source={{uri: img.imageUrl}} />
      ))}
    </PhotoRowContainer>
  );
}

function BuildingEntranceInfoRows({
  accessibility,
}: {
  accessibility?: AccessibilityInfoV2Dto;
}) {
  if (!accessibility) {
    return null;
  }
  const entranceStepType = getBuildingEntranceStepType(accessibility as any);
  const stairInfo = accessibility.buildingAccessibility?.entranceStairInfo;
  const stairHeight =
    accessibility.buildingAccessibility?.entranceStairHeightLevel;
  const description = getStairDescription(stairHeight, stairInfo);

  let title = '';
  switch (entranceStepType) {
    case EntranceStepType.Flat:
      title = '계단, 경사로 없음';
      break;
    case EntranceStepType.SlopeOnly:
      title = '경사로 있음';
      break;
    case EntranceStepType.StairAndSlope:
      title = '계단과 경사로 있음';
      break;
    case EntranceStepType.StairOnly:
      title = '계단 있음';
      break;
  }

  return <InfoRow label="입구 정보" value={title} subValue={description} />;
}

function BuildingElevatorInfoRow({
  accessibility,
}: {
  accessibility?: AccessibilityInfoV2Dto;
}) {
  if (!accessibility?.buildingAccessibility) {
    return null;
  }
  const elevatorType = getBuildingElevatorType(accessibility as any);
  const stairInfo = accessibility.buildingAccessibility.elevatorStairInfo;
  const stairHeight =
    accessibility.buildingAccessibility.elevatorStairHeightLevel;
  const description = getStairDescription(stairHeight, stairInfo);

  let title = '';
  switch (elevatorType) {
    case ElevatorType.ElevatorAfterStair:
      title = '엘리베이터 있지만,\n가는 길에 계단 있음';
      break;
    case ElevatorType.ElevatorNoBarriers:
      title = '엘리베이터 있음';
      break;
    case ElevatorType.NoElevator:
      title = '엘리베이터 없음';
      break;
  }

  return (
    <InfoRow label="엘리베이터 정보" value={title} subValue={description} />
  );
}

function BuildingDoorInfoRow({
  accessibility,
}: {
  accessibility?: AccessibilityInfoV2Dto;
}) {
  const doorTypes =
    accessibility?.buildingAccessibility?.entranceDoorTypes ?? [];
  if (doorTypes.length === 0) {
    return null;
  }
  const title = doorTypes.map(d => doorTypeMap[d]).join(', ');
  return <InfoRow label="출입문 유형" value={title} />;
}

function PlaceEntranceInfoRows({
  accessibility,
}: {
  accessibility?: AccessibilityInfoV2Dto;
}) {
  if (!accessibility) {
    return null;
  }
  const entranceStepType = getPlaceEntranceStepType(accessibility as any);
  const stairInfo = accessibility.placeAccessibility?.stairInfo;
  const stairHeight = accessibility.placeAccessibility?.stairHeightLevel;
  const description = getStairDescription(stairHeight, stairInfo);

  let title = '';
  switch (entranceStepType) {
    case EntranceStepType.Flat:
      title = '계단, 경사로 없음';
      break;
    case EntranceStepType.SlopeOnly:
      title = '경사로 있음';
      break;
    case EntranceStepType.StairAndSlope:
      title = '계단과 경사로 있음';
      break;
    case EntranceStepType.StairOnly:
      title = '계단 있음';
      break;
  }

  return <InfoRow label="입구 정보" value={title} subValue={description} />;
}

function PlaceDoorInfoRow({
  accessibility,
}: {
  accessibility?: AccessibilityInfoV2Dto;
}) {
  const doorTypes = accessibility?.placeAccessibility?.entranceDoorTypes ?? [];
  if (doorTypes.length === 0) {
    return null;
  }
  const title = doorTypes.map(d => doorTypeMap[d]).join(', ');
  return <InfoRow label="출입문 유형" value={title} />;
}

function BuildingDoorDirectionInfoRow({
  accessibility,
}: {
  accessibility?: AccessibilityInfoV2Dto;
}) {
  const doorDir = accessibility?.buildingAccessibility?.doorDirectionType;
  if (!doorDir) {
    return null;
  }
  let title = '';
  switch (doorDir) {
    case BuildingDoorDirectionTypeDto.RoadDirection:
      title = '지상/보도 연결 문';
      break;
    case BuildingDoorDirectionTypeDto.ParkingDirection:
      title = '주차장 방향';
      break;
    case BuildingDoorDirectionTypeDto.Etc:
      title = '기타';
      break;
  }
  return <InfoRow label="출입구 방향" value={title} />;
}

function PlaceDoorDirectionInfoRow({
  accessibility,
}: {
  accessibility?: AccessibilityInfoV2Dto;
}) {
  const doorDir = accessibility?.placeAccessibility?.doorDirectionType;
  if (!doorDir) {
    return null;
  }
  let title = '';
  switch (doorDir) {
    case PlaceDoorDirectionTypeDto.OutsideBuilding:
      title = '건물 밖';
      break;
    case PlaceDoorDirectionTypeDto.InsideBuilding:
      title = '건물 안';
      break;
  }
  return <InfoRow label="출입구 방향" value={title} />;
}

function FloorInfoRow({
  accessibility,
}: {
  accessibility?: AccessibilityInfoV2Dto;
}) {
  if (!accessibility?.placeAccessibility) {
    return null;
  }
  const floorInfo = getFloorAccessibility(accessibility as any);
  const floorDate = dayjs(
    accessibility.placeAccessibility.createdAt.value,
  ).format('YYYY.MM.DD');
  return (
    <AccessibilitySubSection>
      <SubSectionHeader>
        <SubSectionTitle>층 정보</SubSectionTitle>
        <SubSectionDate>{floorDate}</SubSectionDate>
      </SubSectionHeader>
      <InfoRowsContainer>
        <InfoRow
          label="층 정보"
          value={floorInfo.title}
          subValue={floorInfo.description}
        />
      </InfoRowsContainer>
    </AccessibilitySubSection>
  );
}

// ── 홈탭 접근성 섹션 블록 컴포넌트 ──

function HomeBuildingSectionBlock({
  buildingDate,
  accessibility,
}: {
  buildingDate: string;
  accessibility?: AccessibilityInfoV2Dto;
}) {
  if (!accessibility?.buildingAccessibility) {
    return null;
  }
  return (
    <AccessibilitySubSection>
      <SubSectionHeader>
        <SubSectionTitle>건물 출입구</SubSectionTitle>
        <SubSectionDate>{buildingDate}</SubSectionDate>
      </SubSectionHeader>

      <PhotoRow
        images={[
          ...(accessibility.buildingAccessibility.entranceImages ?? []),
          ...(accessibility.buildingAccessibility.elevatorImages ?? []),
        ]}
      />

      <InfoRowsContainer>
        <BuildingEntranceInfoRows accessibility={accessibility} />
        <BuildingElevatorInfoRow accessibility={accessibility} />
        <BuildingDoorInfoRow accessibility={accessibility} />
        <BuildingDoorDirectionInfoRow accessibility={accessibility} />
      </InfoRowsContainer>
    </AccessibilitySubSection>
  );
}

function HomeStoreSectionBlock({
  title,
  placeDate,
  accessibility,
}: {
  title: string;
  placeDate: string;
  accessibility?: AccessibilityInfoV2Dto;
}) {
  if (!accessibility?.placeAccessibility) {
    return null;
  }
  return (
    <AccessibilitySubSection>
      <SubSectionHeader>
        <SubSectionTitle>{title}</SubSectionTitle>
        <SubSectionDate>{placeDate}</SubSectionDate>
      </SubSectionHeader>

      <PhotoRow images={accessibility.placeAccessibility.images ?? []} />

      <InfoRowsContainer>
        <PlaceEntranceInfoRows accessibility={accessibility} />
        <PlaceDoorInfoRow accessibility={accessibility} />
        <PlaceDoorDirectionInfoRow accessibility={accessibility} />
      </InfoRowsContainer>
    </AccessibilitySubSection>
  );
}

function HomeFloorMovementBlock() {
  return (
    <AccessibilitySubSection>
      <SubSectionHeader>
        <SubSectionTitle>층간 이동 정보</SubSectionTitle>
      </SubSectionHeader>
      <FloorMovementEmptyContainer>
        <FloorMovementEmptyText>
          아직 등록된 층간 이동 정보가 없어요
        </FloorMovementEmptyText>
      </FloorMovementEmptyContainer>
    </AccessibilitySubSection>
  );
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

const SectionContainer = styled.View`
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

/* Accessibility subsection */
const AccessibilitySubSection = styled.View`
  gap: 12px;
`;

const SubSectionHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const SubSectionTitle = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -0.32px;
  color: ${color.gray80};
`;

const SubSectionDate = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 12px;
  line-height: 16px;
  letter-spacing: -0.24px;
  color: ${color.gray50};
`;

/* Info rows */
const InfoRowsContainer = styled.View`
  gap: 12px;
`;

const InfoRowContainer = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
`;

const InfoLabel = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.28px;
  color: ${color.gray50};
  min-height: 26px;
  justify-content: center;
  padding-top: 3px;
`;

const InfoValueContainer = styled.View`
  align-items: flex-end;
  gap: 2px;
`;

const InfoValue = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 16px;
  line-height: 26px;
  letter-spacing: -0.32px;
  color: ${color.gray90};
  text-align: right;
`;

const InfoSubValue = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.28px;
  color: ${color.brand50};
`;

/* Photos */
const PhotoRowContainer = styled.View`
  flex-direction: row;
  gap: 4px;
`;

const PhotoThumbnail = styled(Image)`
  width: 114px;
  height: 114px;
  border-radius: 8px;
  background-color: #d9d9d9;
`;

/* Indoor info */
const IndoorContent = styled.View`
  gap: 16px;
`;

const IndoorRow = styled.View`
  flex-direction: row;
  align-items: flex-start;
  gap: 8px;
`;

const IndoorLabel = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 12px;
  line-height: 16px;
  letter-spacing: -0.24px;
  color: ${color.gray40};
  width: 48px;
  padding-top: 4px;
`;

const IndoorValueContainer = styled.View`
  flex: 1;
  gap: 8px;
`;

const TagWrap = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 4px;
`;

const Tag = styled.View`
  background-color: ${color.gray5};
  border-radius: 6px;
  padding-horizontal: 6px;
  padding-vertical: 4px;
`;

const TagText = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 12px;
  line-height: 16px;
  letter-spacing: -0.24px;
  color: ${color.brand50};
`;

const IndoorDescription = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 13px;
  line-height: 20px;
  color: ${color.gray90};
`;

const IndoorFeatureText = styled.Text`
  font-family: ${font.pretendardMedium};
  font-size: 14px;
  line-height: 22px;
  letter-spacing: -0.28px;
  color: ${color.gray90};
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

/* 층간 이동 정보 빈 상태 */
const FloorMovementEmptyContainer = styled.View`
  background-color: ${color.gray5};
  border-radius: 12px;
  padding: 20px;
  align-items: center;
  justify-content: center;
`;

const FloorMovementEmptyText = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 14px;
  line-height: 22px;
  letter-spacing: -0.28px;
  color: ${color.gray50};
`;

/* Bottom Padding */
const BottomPadding = styled.View`
  height: 100px;
`;
