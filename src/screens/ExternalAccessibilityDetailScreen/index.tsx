import Clipboard from '@react-native-clipboard/clipboard';
import {useNavigation} from '@react-navigation/native';
import {useQuery} from '@tanstack/react-query';
import React from 'react';
import {Dimensions, SafeAreaView, ScrollView, Text, View} from 'react-native';
import styled from 'styled-components/native';

import LeftArrowIcon from '@/assets/icon/ic_arrow_left.svg';
import {SccPressable} from '@/components/SccPressable';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import BookmarkIcon from '@/assets/icon/ic_bookmark.svg';
import CopyIcon from '@/assets/icon/ic_copy.svg';
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
import SccRemoteImage from '@/components/SccRemoteImage';
import {ScreenLayout} from '@/components/ScreenLayout';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {ToiletAccessibilityDetailDto} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import {ScreenProps} from '@/navigation/Navigation.screens';
import AvailableLabel from '@/screens/ExternalAccessibilityDetailScreen/AvailableLabel';
import {mapDetailToToiletDetails} from '@/screens/ToiletMapScreen/data';
import ToastUtils from '@/utils/ToastUtils.ts';

export interface ExternalAccessibilityDetailScreenParams {
  /** 신규: 통합 화장실 ID (prefix TA). */
  toiletAccessibilityId?: string;
  /** 하위 호환: 구버전 진입점에서 사용하던 ExternalAccessibility ID. */
  externalAccessibilityId?: string;
}

const ExternalAccessibilityDetailScreen = ({
  route,
}: ScreenProps<'ExternalAccessibilityDetail'>) => {
  const {toiletAccessibilityId, externalAccessibilityId} = route.params;
  const {toiletAccessibilityApi} = useAppComponents();
  // 신규 파라미터(toiletAccessibilityId)가 없으면 구버전 externalAccessibilityId로 폴백.
  const accessibilityId = toiletAccessibilityId ?? externalAccessibilityId;
  const {data} = useQuery({
    enabled: accessibilityId != null,
    queryKey: ['toiletAccessibilityDetail', accessibilityId],
    queryFn: async () => {
      return await toiletAccessibilityApi.getToiletAccessibility({
        toiletAccessibilityId: accessibilityId!,
      });
    },
  });
  const detail = data?.data;
  if (detail === undefined) {
    // TODO: 로딩 UI
    return <Text>Loading...</Text>;
  }

  if (detail.sourceType === 'USER_TOILET_REVIEW') {
    return <UserToiletDetail detail={detail} />;
  }

  return <ExternalToiletDetail detail={detail} />;
};

const ExternalToiletDetail = ({
  detail,
}: {
  detail: ToiletAccessibilityDetailDto;
}) => {
  const toiletDetails = mapDetailToToiletDetails(detail);
  const onCopy = () => {
    if (toiletDetails.address) {
      Clipboard.setString(toiletDetails.address);
      ToastUtils.show('주소가 복사되었습니다.');
    }
  };
  const onShare = () => {
    ToastUtils.show('준비 중입니다.');
  };
  const onBookmark = () => {
    ToastUtils.show('준비 중입니다.');
  };

  // TODO: API에서 받아올 예정 (yyyy-MM-dd 형식)
  const updateDateRaw = '2023-12-09';
  const updateDateFormatted = updateDateRaw.replace(/-/g, '. ');

  return (
    <ScreenLayout isHeaderVisible={false} safeAreaEdges={['bottom']}>
      <ScrollView>
        <AppBar />
        <View>
          <CoverImage
            resizeMethod="resize"
            source={{uri: toiletDetails.imageUrl}}
          />
        </View>
        <Container>
          <Section>
            <TitleArea>
              <AvailableLabel
                availableState={toiletDetails.available?.state ?? 'UNKNOWN'}
                text={toiletDetails.available?.desc ?? ''}
              />
              <TitleText>{toiletDetails.name}</TitleText>
              <SubSectionLabel>{toiletDetails.address}</SubSectionLabel>
              <CopyButton
                elementName="external_accessibility_copy_button"
                onPress={onCopy}
                style={{marginTop: -4}}>
                <CopyIcon />
                <CopyText>복사</CopyText>
              </CopyButton>
              <SectionDivider />
              <TextButtonContainer>
                <TextButton
                  elementName="external_accessibility_share_button"
                  onPress={onShare}>
                  <ShareIcon />
                  <TextButtonText>공유</TextButtonText>
                </TextButton>
                <VerticalDivider />
                <TextButton
                  elementName="external_accessibility_bookmark_button"
                  onPress={onBookmark}>
                  <BookmarkIcon color={color.gray80} />
                  <TextButtonText>저장</TextButtonText>
                </TextButton>
              </TextButtonContainer>
            </TitleArea>
          </Section>
          <Section>
            <SectionTitleRow>
              <SectionTitleText>화장실 사용 정보</SectionTitleText>
              <SectionUpdateDate>{updateDateFormatted}</SectionUpdateDate>
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
            <SubSection>
              <SubSectionLabel>사용가능여부</SubSectionLabel>
              <SubSectionTitle>
                {
                  {
                    AVAILABLE: '사용가능',
                    UNAVAILABLE: '사용불가',
                    UNKNOWN: '알 수 없음',
                  }[toiletDetails.available?.state ?? 'UNKNOWN']
                }
              </SubSectionTitle>
              <SubSectionDescription>
                {toiletDetails.available?.desc}
              </SubSectionDescription>
            </SubSection>
          </Section>
          <Section>
            <SectionTitleText>화장실 접근 정보</SectionTitleText>
            <SectionDivider />
            {toiletDetails.entrance?.state && (
              <IconedSection>
                <SubSection>
                  <SubSectionLabel>화장실 입구</SubSectionLabel>
                  <SubSectionTitle>
                    {toiletDetails.entrance.desc}
                  </SubSectionTitle>
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
                  {toiletDetails.door.state === 'UNKNOWN' && (
                    <DoorUnknownIcon />
                  )}
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
                  가로 {toiletDetails.stall.depth}
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
                <SubSectionTitle>
                  {toiletDetails.washStandHandle}
                </SubSectionTitle>
              </SubSection>
            )}
          </Section>
          <Section>
            <SectionTitleText>기타 참고사항</SectionTitleText>
            {toiletDetails.extra && (
              <ExtraInfos>
                <SubSectionDescription>
                  {toiletDetails.extra}
                </SubSectionDescription>
              </ExtraInfos>
            )}
          </Section>
          <Footer>
            <FooterText>
              본 저작물은 ‘마트 서울맵 - (동행)휠체어도 가는 화장실 지도'를
              이용하였습니다.
            </FooterText>
          </Footer>
        </Container>
      </ScrollView>
    </ScreenLayout>
  );
};

const USER_TOILET_IMAGE_WIDTH = Dimensions.get('window').width;

const UserToiletDetail = ({detail}: {detail: ToiletAccessibilityDetailDto}) => {
  const onCopy = () => {
    if (detail.address) {
      Clipboard.setString(detail.address);
      ToastUtils.show('주소가 복사되었습니다.');
    }
  };

  return (
    <ScreenLayout isHeaderVisible={false} safeAreaEdges={['bottom']}>
      <ScrollView>
        <AppBar />
        {detail.images.length > 0 && (
          <View>
            {detail.images.map(image => (
              <SccRemoteImage
                key={image.imageUrl}
                imageUrl={image.imageUrl}
                style={{width: USER_TOILET_IMAGE_WIDTH}}
                resizeMode="cover"
              />
            ))}
          </View>
        )}
        <Container>
          <Section>
            <TitleArea>
              <TitleText>{detail.name}</TitleText>
              {detail.address != null && (
                <>
                  <SubSectionLabel>{detail.address}</SubSectionLabel>
                  <CopyButton
                    elementName="toilet_accessibility_copy_button"
                    onPress={onCopy}
                    style={{marginTop: -4}}>
                    <CopyIcon />
                    <CopyText>복사</CopyText>
                  </CopyButton>
                </>
              )}
            </TitleArea>
          </Section>
          {detail.locationComment != null && (
            <Section>
              <SectionTitleText>화장실 위치</SectionTitleText>
              <SectionDivider />
              <SubSectionDescription>
                {detail.locationComment}
              </SubSectionDescription>
            </Section>
          )}
          {detail.comment != null && (
            <Section>
              <SectionTitleText>기타 참고사항</SectionTitleText>
              <SectionDivider />
              <SubSectionDescription>{detail.comment}</SubSectionDescription>
            </Section>
          )}
        </Container>
      </ScrollView>
    </ScreenLayout>
  );
};

function AppBar() {
  const navigation = useNavigation();

  return (
    <AppBarContainer>
      <SccPressable
        elementName="external_accessibility_back_button"
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

const SectionUpdateDate = styled.Text`
  font-size: 12px;
  font-family: ${() => font.pretendardRegular};
  color: ${color.gray70};
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

const CoverImage = styled.Image`
  width: 100%;
  aspect-ratio: 375 / 300;
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

export default ExternalAccessibilityDetailScreen;
