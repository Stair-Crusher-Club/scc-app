import Clipboard from '@react-native-clipboard/clipboard';
import {useNavigation} from '@react-navigation/native';
import {useQuery} from '@tanstack/react-query';
import dayjs from 'dayjs';
import React, {useState} from 'react';
import {Linking, SafeAreaView, ScrollView} from 'react-native';
import styled from 'styled-components/native';

import LeftArrowIcon from '@/assets/icon/ic_arrow_left.svg';
import BookmarkIcon from '@/assets/icon/ic_bookmark.svg';
import CopyIcon from '@/assets/icon/ic_copy.svg';
import RouteFillIcon from '@/assets/icon/ic_route_fill.svg';
import ShareIcon from '@/assets/icon/ic_share.svg';
import GenderBothIcon from '@/assets/icon/ic_toilet_both.svg';
import DoorAutoIcon from '@/assets/icon/ic_toilet_door_auto.svg';
import DoorFoldIcon from '@/assets/icon/ic_toilet_door_fold.svg';
import DoorSlideIcon from '@/assets/icon/ic_toilet_door_slide.svg';
import DoorSwingIcon from '@/assets/icon/ic_toilet_door_swing.svg';
import DoorUnknownIcon from '@/assets/icon/ic_toilet_door_unknown.svg';
import EntranceSlopeIcon from '@/assets/icon/ic_toilet_entrance_slope.svg';
import EntranceStepIcon from '@/assets/icon/ic_toilet_entrance_step.svg';
import GenderFemaleIcon from '@/assets/icon/ic_toilet_female.svg';
import GenderMaleIcon from '@/assets/icon/ic_toilet_male.svg';
import {LoadingView} from '@/components/LoadingView';
import RoadView from '@/components/maps/RoadView';
import {SccPressable} from '@/components/SccPressable';
import {ScreenLayout} from '@/components/ScreenLayout';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import type {ToiletAccessibilityDto as ToiletAccessibilityDtoType} from '@/generated-sources/openapi';
import {
  AccessibilitySourceDto,
  ToiletDetailDto,
} from '@/generated-sources/openapi';
import NavigationAppsBottomSheet from '@/screens/PlaceDetailScreen/modals/NavigationAppsBottomSheet';
import useAppComponents from '@/hooks/useAppComponents';
import {ScreenProps} from '@/navigation/Navigation.screens';
import AvailableLabel from '@/screens/ToiletDetailScreen/AvailableLabel';
import ToiletImageCarousel from '@/screens/ToiletDetailScreen/ToiletImageCarousel';
import {
  accessibilitySourceLabel,
  mapToiletDetailsToToiletDetails,
  ToiletDetails,
} from '@/components/toilet/data';
import ToastUtils from '@/utils/ToastUtils.ts';

export interface ToiletDetailScreenParams {
  /** Toilet ID (prefix: TLT). */
  toiletId: string;
}

const ToiletDetailScreen = ({route}: ScreenProps<'ToiletDetail'>) => {
  const {toiletId} = route.params;
  const {toiletApi} = useAppComponents();
  const {data, isLoading, isError, error} = useQuery({
    enabled: toiletId != null,
    queryKey: ['toiletDetail', toiletId],
    queryFn: async () => {
      return await toiletApi.getToilet({toiletId});
    },
  });
  const detail = data?.data;

  if (isLoading) {
    return (
      <ScreenLayout isHeaderVisible={false} safeAreaEdges={['bottom']}>
        <AppBar />
        <LoadingView />
      </ScreenLayout>
    );
  }

  if (isError || detail === undefined) {
    if (error != null) {
      ToastUtils.showOnApiError(error);
    }
    return (
      <ScreenLayout isHeaderVisible={false} safeAreaEdges={['bottom']}>
        <AppBar />
        <ErrorContainer>
          <ErrorText>화장실 정보를 불러오지 못했습니다.</ErrorText>
        </ErrorContainer>
      </ScreenLayout>
    );
  }

  return <ToiletDetail detail={detail} />;
};

const ToiletDetail = ({detail}: {detail: ToiletDetailDto}) => {
  // 여러 소스(유저 리뷰 N개 + 공공데이터 N개)가 accessibilities 배열로 내려온다.
  // 소스마다 섹션을 반복 렌더하면 같은 섹션 타입이 중복되므로,
  // sourceType 분기 없이 "섹션 타입별 1회"로 집계(aggregate)하여 단일 뷰로 렌더한다.

  // 이미지: 모든 accessibility의 images를 하나로 합쳐 1개 캐러셀로 보여준다.
  const allImages = detail.accessibilities.flatMap(
    accessibility => accessibility.images,
  );
  // 유저 리뷰 섹션: locationComment / comment를 가진 첫 번째 대표 소스를 사용한다.
  // (등록자/등록시점을 함께 표시하기 위해 값이 아니라 소스 accessibility를 찾는다.)
  const locationCommentSource = detail.accessibilities.find(
    accessibility => accessibility.locationComment != null,
  );
  const commentSource = detail.accessibilities.find(
    accessibility => accessibility.comment != null,
  );
  const locationComment = locationCommentSource?.locationComment;
  const comment = commentSource?.comment;
  // 등록자/등록시점은 유저 리뷰 소스 기준으로 타이틀 영역에 한 번만 표시한다.
  const reviewSource = locationCommentSource ?? commentSource;
  // 공공데이터 상세(toiletDetails): toiletDetails를 가진 첫 번째 대표 소스만 사용한다.
  // 공공데이터 상세(toiletDetails): toiletDetails를 가진 첫 번째 대표 소스만 사용한다.
  const publicDataSource = detail.accessibilities.find(
    accessibility => accessibility.toiletDetails != null,
  );
  const representativeToiletDetails = publicDataSource?.toiletDetails;
  const publicToiletDetails: ToiletDetails | undefined =
    representativeToiletDetails != null
      ? mapToiletDetailsToToiletDetails(
          detail.id,
          detail.name,
          detail.address ?? undefined,
          detail.location,
          representativeToiletDetails,
        )
      : undefined;
  // 타이틀 영역의 사용가능 라벨은 공공데이터 상세에서 가져온다.
  const availableForLabel = publicToiletDetails?.available;
  // 로드뷰 노출 조건: PA급 상세 필드 중 하나라도 없으면(hasRichToiletDetail=false) 로드뷰 노출.
  // 공공데이터 전용 필드(openingHours/phoneNumber 등)가 있어도 PA급이 없으면 로드뷰를 띄운다.
  const hasRichToiletDetail = [
    publicToiletDetails?.stall?.width,
    publicToiletDetails?.stall?.depth,
    publicToiletDetails?.door?.desc,
    publicToiletDetails?.entrance?.desc,
    publicToiletDetails?.accessDesc,
    publicToiletDetails?.doorSideRoom,
    publicToiletDetails?.washStandBelowRoom,
    publicToiletDetails?.washStandHandle,
  ].some(v => !!v);

  const onCopy = () => {
    if (detail.address) {
      Clipboard.setString(detail.address);
      ToastUtils.show('주소가 복사되었습니다.');
    }
  };
  const onShare = () => {
    ToastUtils.show('준비 중입니다.');
  };
  const onBookmark = () => {
    ToastUtils.show('준비 중입니다.');
  };
  const [showNavigation, setShowNavigation] = useState(false);

  return (
    <ScreenLayout isHeaderVisible={false} safeAreaEdges={['bottom']}>
      <ScrollView>
        <AppBar />
        {allImages.length > 0 && <ToiletImageCarousel images={allImages} />}
        <Container>
          <Section>
            <TitleArea>
              {availableForLabel && (
                <AvailableLabel
                  availableState={availableForLabel.state}
                  text={availableForLabel.desc}
                />
              )}
              <TitleText>{detail.name}</TitleText>
              {detail.address != null && (
                <AddressRow>
                  <AddressText>{detail.address}</AddressText>
                  <CopyButton
                    elementName="toilet_detail_copy_button"
                    onPress={onCopy}>
                    <CopyIcon />
                    <CopyText>복사</CopyText>
                  </CopyButton>
                </AddressRow>
              )}
              {detail.location != null && (
                <DirectionsRow>
                  <RouteFillIcon width={20} height={20} color={color.gray30} />
                  <SccTouchableOpacity
                    elementName="toilet_detail_directions_button"
                    onPress={() => setShowNavigation(true)}>
                    <DirectionsText>길찾기</DirectionsText>
                  </SccTouchableOpacity>
                </DirectionsRow>
              )}
              <MetaRow
                reviewSource={reviewSource ?? null}
                publicDataSource={publicDataSource ?? null}
              />
              <SectionDivider />
              <TextButtonContainer>
                <TextButton
                  elementName="toilet_detail_share_button"
                  onPress={onShare}>
                  <ShareIcon />
                  <TextButtonText>공유</TextButtonText>
                </TextButton>
                <VerticalDivider />
                <TextButton
                  elementName="toilet_detail_bookmark_button"
                  onPress={onBookmark}>
                  <BookmarkIcon color={color.gray80} />
                  <TextButtonText>저장</TextButtonText>
                </TextButton>
              </TextButtonContainer>
            </TitleArea>
          </Section>

          {locationComment != null && (
            <Section>
              <SectionTitleText>화장실 위치</SectionTitleText>
              <SectionDivider />
              <SubSectionDescription>{locationComment}</SubSectionDescription>
            </Section>
          )}

          {comment != null && (
            <Section>
              <SectionTitleText>기타 참고사항</SectionTitleText>
              <SectionDivider />
              <SubSectionDescription>{comment}</SubSectionDescription>
            </Section>
          )}

          {detail.location != null && !hasRichToiletDetail && (
            <RoadView
              position={{lat: detail.location.lat, lng: detail.location.lng}}
              name={detail.name}
            />
          )}

          {publicToiletDetails != null && (
            <ToiletPublicDetailSections
              toiletDetails={publicToiletDetails}
              showSeoulAttribution={detail.accessibilities.some(
                a => a.source === AccessibilitySourceDto.SmartSeoulMap,
              )}
            />
          )}
        </Container>
      </ScrollView>
      {detail.location != null && (
        <NavigationAppsBottomSheet
          isVisible={showNavigation}
          latitude={detail.location.lat}
          longitude={detail.location.lng}
          placeName={detail.name}
          onClose={() => setShowNavigation(false)}
        />
      )}
    </ScreenLayout>
  );
};

const ToiletPublicDetailSections = ({
  toiletDetails,
  showSeoulAttribution,
}: {
  toiletDetails: ToiletDetails;
  showSeoulAttribution: boolean;
}) => {
  const hasUsageInfo =
    toiletDetails.gender != null ||
    toiletDetails.available != null ||
    toiletDetails.openingHours != null ||
    toiletDetails.phoneNumber != null;
  const hasAccessInfo =
    toiletDetails.entrance?.state != null ||
    toiletDetails.door?.state != null ||
    toiletDetails.accessDesc != null;
  const hasInteriorInfo =
    toiletDetails.stall != null ||
    toiletDetails.doorSideRoom != null ||
    toiletDetails.washStandBelowRoom != null ||
    toiletDetails.washStandHandle != null;

  return (
    <>
      {hasUsageInfo && (
        <Section>
          <SectionTitleRow>
            <SectionTitleText>화장실 사용 정보</SectionTitleText>
          </SectionTitleRow>
          <SectionDivider />
          {toiletDetails.gender && (
            <IconedSection>
              <SubSection>
                <SubSectionLabel>이용성별</SubSectionLabel>
                <SubSectionTitle>{toiletDetails.gender.desc}</SubSectionTitle>
              </SubSection>
              <IconArea>
                {toiletDetails.gender.state === 'MALE' && <GenderMaleIcon />}
                {toiletDetails.gender.state === 'FEMALE' && (
                  <GenderFemaleIcon />
                )}
                {toiletDetails.gender.state === 'BOTH' && <GenderBothIcon />}
              </IconArea>
            </IconedSection>
          )}
          {toiletDetails.available && (
            <SubSection>
              <SubSectionLabel>사용가능여부</SubSectionLabel>
              <SubSectionTitle>
                {
                  {
                    AVAILABLE: '사용가능',
                    UNAVAILABLE: '사용불가',
                    UNKNOWN: '알 수 없음',
                  }[toiletDetails.available.state]
                }
              </SubSectionTitle>
              <SubSectionDescription>
                {toiletDetails.available.desc}
              </SubSectionDescription>
            </SubSection>
          )}
          {toiletDetails.openingHours != null && (
            <SubSection>
              <SubSectionLabel>개방시간</SubSectionLabel>
              <SubSectionTitle>{toiletDetails.openingHours}</SubSectionTitle>
            </SubSection>
          )}
          {toiletDetails.phoneNumber != null && (
            <SubSection>
              <SubSectionLabel>전화번호</SubSectionLabel>
              <PhoneRow>
                <SccTouchableOpacity
                  elementName="toilet_detail_phone_call"
                  onPress={() =>
                    Linking.openURL(`tel:${toiletDetails.phoneNumber}`)
                  }>
                  <PhoneNumberText>{toiletDetails.phoneNumber}</PhoneNumberText>
                </SccTouchableOpacity>
                <CopyButton
                  elementName="toilet_detail_phone_copy"
                  onPress={() => {
                    Clipboard.setString(toiletDetails.phoneNumber!);
                    ToastUtils.show('전화번호가 복사되었습니다.');
                  }}>
                  <CopyIcon />
                  <CopyText>복사</CopyText>
                </CopyButton>
              </PhoneRow>
            </SubSection>
          )}
        </Section>
      )}

      {hasAccessInfo && (
        <Section>
          <SectionTitleText>화장실 접근 정보</SectionTitleText>
          <SectionDivider />
          {toiletDetails.entrance?.state && (
            <IconedSection>
              <SubSection>
                <SubSectionLabel>화장실 입구</SubSectionLabel>
                <SubSectionTitle>{toiletDetails.entrance.desc}</SubSectionTitle>
              </SubSection>
              <IconArea>
                {toiletDetails.entrance.state === 'STEP' && (
                  <EntranceStepIcon />
                )}
                {toiletDetails.entrance.state === 'SLOPE' && (
                  <EntranceSlopeIcon />
                )}
              </IconArea>
            </IconedSection>
          )}
          {toiletDetails.door?.state && (
            <IconedSection>
              <SubSection>
                <SubSectionLabel>화장실 출입문</SubSectionLabel>
                <SubSectionTitle>{toiletDetails.door.desc}</SubSectionTitle>
              </SubSection>
              <IconArea>
                {toiletDetails.door.state === 'AUTO' && <DoorAutoIcon />}
                {toiletDetails.door.state === 'SLIDE' && <DoorSlideIcon />}
                {toiletDetails.door.state === 'SWING' && <DoorSwingIcon />}
                {toiletDetails.door.state === 'FOLD' && <DoorFoldIcon />}
                {toiletDetails.door.state === 'UNKNOWN' && <DoorUnknownIcon />}
              </IconArea>
            </IconedSection>
          )}
          {toiletDetails.accessDesc && (
            <RecommendedAccessRoute>
              <SubSectionTitle style={{marginTop: 0}}>
                추천 접근 경로💡
              </SubSectionTitle>
              <SubSectionDescription>
                {toiletDetails.accessDesc}
              </SubSectionDescription>
            </RecommendedAccessRoute>
          )}
        </Section>
      )}

      {hasInteriorInfo && (
        <Section>
          <SectionTitleText>화장실 내부 정보</SectionTitleText>
          <SectionDivider />
          {toiletDetails.stall && (
            <SubSection>
              <SubSectionLabel>내부공간 사이즈</SubSectionLabel>
              <SubSectionTitle>
                가로 {toiletDetails.stall.width}
              </SubSectionTitle>
              <SubSectionTitle>
                세로 {toiletDetails.stall.depth}
              </SubSectionTitle>
            </SubSection>
          )}
          {toiletDetails.doorSideRoom && (
            <SubSection>
              <SubSectionLabel>대변기 옆 공간 여부</SubSectionLabel>
              <SubSectionTitle>{toiletDetails.doorSideRoom}</SubSectionTitle>
            </SubSection>
          )}
          {toiletDetails.washStandBelowRoom && (
            <SubSection>
              <SubSectionLabel>세면대 아래 공간</SubSectionLabel>
              <SubSectionTitle>
                {toiletDetails.washStandBelowRoom}
              </SubSectionTitle>
            </SubSection>
          )}
          {toiletDetails.washStandHandle && (
            <SubSection>
              <SubSectionLabel>세면대 손잡이</SubSectionLabel>
              <SubSectionTitle>{toiletDetails.washStandHandle}</SubSectionTitle>
            </SubSection>
          )}
        </Section>
      )}

      {toiletDetails.extra && (
        <Section>
          <SectionTitleText>기타 참고사항</SectionTitleText>
          <ExtraInfos>
            <SubSectionDescription>{toiletDetails.extra}</SubSectionDescription>
          </ExtraInfos>
        </Section>
      )}

      {showSeoulAttribution && (
        <Footer>
          <FooterText>
            본 저작물은 ‘스마트 서울맵 - (동행)휠체어도 가는 화장실 지도'를
            이용하였습니다.
          </FooterText>
        </Footer>
      )}
    </>
  );
};

/**
 * 타이틀 영역 메타 행: 리뷰 소스가 있으면 등록자+등록일, 없고 공공데이터 소스만 있으면 출처+확인일.
 * 어떤 경우든 meta 행은 1개만 렌더한다.
 */
function MetaRow({
  reviewSource,
  publicDataSource,
}: {
  reviewSource: ToiletAccessibilityDtoType | null;
  publicDataSource: ToiletAccessibilityDtoType | null;
}) {
  if (reviewSource != null) {
    const userName = reviewSource.registeredUserName ?? '익명';
    const dateStr = reviewSource.createdAt
      ? dayjs(reviewSource.createdAt.value).format('YYYY.MM.DD')
      : null;
    return (
      <RegistrantRow>
        <RegistrantName>{userName}</RegistrantName>
        {dateStr != null && <RegistrantDate>{dateStr}</RegistrantDate>}
      </RegistrantRow>
    );
  }
  if (publicDataSource?.source != null) {
    const sourceName = accessibilitySourceLabel(publicDataSource.source);
    const dateStr = publicDataSource.lastVerifiedAt
      ? dayjs(publicDataSource.lastVerifiedAt.value).format('YYYY.MM.DD')
      : null;
    return (
      <RegistrantRow>
        <RegistrantName>{sourceName}</RegistrantName>
        {dateStr != null && <RegistrantDate>{dateStr} 확인</RegistrantDate>}
      </RegistrantRow>
    );
  }
  return null;
}

function AppBar() {
  const navigation = useNavigation();

  return (
    <AppBarContainer>
      <SccPressable
        elementName="toilet_detail_back_button"
        hitSlop={2}
        onPress={() => navigation.goBack()}>
        <BackButton>
          <LeftArrowIcon width={24} height={24} color={color.black} />
        </BackButton>
      </SccPressable>
    </AppBarContainer>
  );
}

const AppBarContainer = styled(SafeAreaView)`
  position: absolute;
  top: 0px;
  z-index: 999;
  width: 100%;
  flex-direction: row;
  margin-top: 13px;
  margin-left: 20px;
  align-items: center;
  padding: 10px 8px;
`;

const BackButton = styled.View({
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: 'white',
});

const ErrorContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 30px;
`;

const ErrorText = styled.Text`
  font-size: 16px;
  font-family: ${() => font.pretendardRegular};
  color: ${color.gray80};
`;

const Container = styled.View`
  flex: 1;
  gap: 13px;
  background-color: ${color.gray10};
`;

const TitleText = styled.Text`
  font-size: 20px;
  line-height: 32px;
  font-family: ${() => font.pretendardBold};
  color: ${color.black};
`;

const SectionTitleText = styled.Text`
  font-size: 18px;
  font-family: ${() => font.pretendardBold};
  color: ${color.black};
`;

const SectionTitleRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const SectionDivider = styled.View`
  height: 1px;
  background-color: ${color.gray20};
  width: 100%;
`;

const Section = styled.View`
  background-color: white;
  padding: 30px;
  flex-direction: column;
  gap: 20px;
  align-items: flex-start;
`;

const IconedSection = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;

const IconArea = styled.View`
  width: 58px;
  height: 58px;
  background-color: ${color.gray10};
  border-radius: 14px;
  align-items: center;
  justify-content: center;
`;

const SubSection = styled.View`
  flex-grow: 1;
  flex-direction: column;
  align-items: flex-start;
`;

const SubSectionLabel = styled.Text`
  font-size: 14px;
  font-family: ${() => font.pretendardBold};
  color: ${color.gray70};
`;

const SubSectionTitle = styled.Text`
  font-size: 20px;
  line-height: 32px;
  margin-top: 8px;
  font-family: ${() => font.pretendardBold};
  color: ${color.black};
`;

const PhoneRow = styled.View`
  margin-top: 8px;
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

const PhoneNumberText = styled.Text`
  font-size: 20px;
  line-height: 32px;
  font-family: ${() => font.pretendardBold};
  color: ${color.brand50};
  text-decoration-line: underline;
`;

const SubSectionDescription = styled.Text`
  font-size: 16px;
  margin-top: 4px;
  font-family: ${font.pretendardRegular};
  color: ${color.gray90};
`;

const RecommendedAccessRoute = styled.View`
  width: 100%;
  border-radius: 14px;
  border-color: ${color.brandColor};
  border-width: 1.5px;
  flex-direction: column;
  padding: 16px;
`;

const ExtraInfos = styled.View`
  width: 100%;
  background-color: ${color.gray10};
  padding: 20px;
  border-radius: 20px;
`;

const Footer = styled.View`
  width: 100%;
  background-color: ${color.gray10};
  padding-top: 20px;
  padding-left: 20px;
  padding-right: 20px;
  padding-bottom: 30px;
`;

const FooterText = styled.Text`
  font-size: 10px;
  font-family: ${() => font.pretendardRegular};
  color: ${color.gray80};
`;

const TitleArea = styled.View`
  gap: 12px;
  align-items: flex-start;
  display: flex;
  flex-direction: column;
`;

const RegistrantRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const RegistrantName = styled.Text`
  font-size: 12px;
  line-height: 16px;
  font-family: ${() => font.pretendardMedium};
  color: ${color.brand50};
`;

const RegistrantDate = styled.Text`
  font-size: 12px;
  line-height: 16px;
  font-family: ${() => font.pretendardRegular};
  color: ${color.gray60};
`;

const AddressRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  flex-shrink: 1;
`;

const DirectionsRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
`;

const DirectionsText = styled.Text`
  font-family: ${() => font.pretendardMedium};
  font-size: 14px;
  color: ${() => color.gray70};
  text-decoration-line: underline;
`;

const AddressText = styled.Text`
  font-size: 14px;
  font-family: ${() => font.pretendardBold};
  color: ${color.gray70};
  flex-shrink: 1;
`;

const CopyButton = styled(SccTouchableOpacity)`
  gap: 4px;
  flex-direction: row;
  align-items: center;
`;

const CopyText = styled.Text`
  font-size: 14px;
  font-family: ${() => font.pretendardMedium};
  color: ${color.brandColor};
`;

const TextButton = styled(SccTouchableOpacity)`
  flex-grow: 1;
  align-items: center;
  flex-direction: row;
  justify-content: center;
  gap: 4px;
`;

const VerticalDivider = styled.View`
  width: 1px;
  height: 22px;
  background-color: ${color.gray20};
`;

const TextButtonText = styled.Text`
  font-size: 14px;
  font-family: ${() => font.pretendardRegular};
  color: ${color.black};
`;

const TextButtonContainer = styled.View`
  align-items: center;
  flex-direction: row;
  gap: 8px;
`;

export default ToiletDetailScreen;
