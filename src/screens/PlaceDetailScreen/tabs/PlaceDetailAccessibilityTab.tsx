import dayjs from 'dayjs';
import React from 'react';
import {Platform, View} from 'react-native';
import Toast from 'react-native-root-toast';
import styled from 'styled-components/native';

import PlusIcon from '@/assets/icon/ic_plus.svg';
import {SccButton} from '@/components/atoms';
import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import FeedbackButton from '@/components/FeedbackButton';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  AccessibilityInfoV2Dto,
  Building,
  Place,
  ReportTargetTypeDto,
} from '@/generated-sources/openapi';
import {useUpvoteToggle} from '@/hooks/useUpvoteToggle';
import useNavigateWithLocationCheck from '@/hooks/useNavigateWithLocationCheck';
import useNavigation from '@/navigation/useNavigation';
import {useCheckAuth} from '@/utils/checkAuth';
import {useFormScreenVersion} from '@/utils/accessibilityFlags';

import BuildingDoorInfo from '../components/BuildingDoorInfo';
import BuildingElevatorInfo from '../components/BuildingElevatorInfo';
import BuildingEntranceStepInfo from '../components/BuildingEntranceStepInfo';
import PlaceDetailCommentSection from '../components/PlaceDetailCommentSection';
import ImageList from '../components/PlaceDetailImageList';
import PlaceDoorInfo from '../components/PlaceDoorInfo';
import PlaceEntranceStepInfo from '../components/PlaceEntranceStepInfo';
import PlaceFloorInfo from '../components/PlaceFloorInfo';
import {
  useAccessibilityOrdering,
  AccessibilitySectionType,
} from '../hooks/useAccessibilityOrdering';
import PlaceDetailCrusher from '../sections/PlaceDetailCrusher';
import * as S from '../sections/PlaceDetailEntranceSection.style';

interface Props {
  accessibility?: AccessibilityInfoV2Dto;
  place: Place;
  building: Building;
  isAccessibilityRegistrable?: boolean;
  onRegister?: () => void;
  showNegativeFeedbackBottomSheet?: (type: ReportTargetTypeDto) => void;
  allowDuplicateRegistration?: boolean;
}

export default function PlaceDetailAccessibilityTab({
  accessibility,
  place,
  building,
  isAccessibilityRegistrable,
  onRegister,
  showNegativeFeedbackBottomSheet,
  allowDuplicateRegistration,
}: Props) {
  const navigation = useNavigation();
  const checkAuth = useCheckAuth();
  const formVersion = useFormScreenVersion();
  const {navigateWithLocationCheck, LocationConfirmModal} =
    useNavigateWithLocationCheck();
  const sectionOrder = useAccessibilityOrdering(accessibility);

  const {
    isUpvoted: isPlaceUpvoted,
    totalUpvoteCount: placeUpvoteCount,
    toggleUpvote: togglePlaceUpvote,
  } = useUpvoteToggle({
    initialIsUpvoted: accessibility?.placeAccessibility?.isUpvoted ?? false,
    initialTotalCount: accessibility?.placeAccessibility?.totalUpvoteCount,
    targetId: accessibility?.placeAccessibility?.id,
    targetType: 'PLACE_ACCESSIBILITY',
    placeId: place.id,
  });

  const {
    isUpvoted: isBuildingUpvoted,
    totalUpvoteCount: buildingUpvoteCount,
    toggleUpvote: toggleBuildingUpvote,
  } = useUpvoteToggle({
    initialIsUpvoted: accessibility?.buildingAccessibility?.isUpvoted ?? false,
    initialTotalCount: accessibility?.buildingAccessibility?.totalUpvoteCount,
    targetId: accessibility?.buildingAccessibility?.id,
    targetType: 'BUILDING_ACCESSIBILITY',
    placeId: place.id,
  });

  const handleBuildingRegister = () => {
    if (Platform.OS === 'web') {
      Toast.show('준비 중입니다 💪', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
      });
      return;
    }
    checkAuth(async () => {
      await navigateWithLocationCheck({
        targetLocation: building.location,
        address: building.address,
        type: 'building',
        onNavigate: () => {
          if (formVersion === 'v2') {
            navigation.navigate('BuildingFormV2', {place, building});
            return;
          }
          navigation.navigate('BuildingForm', {place, building});
        },
      });
    });
  };

  function handlePressAddPlaceComment() {
    if (Platform.OS === 'web') {
      Toast.show('준비 중입니다 💪', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
      });
      return;
    }
    navigation.navigate('AddComment', {type: 'place', placeId: place.id});
  }

  function handlePressAddBuildingComment() {
    if (Platform.OS === 'web') {
      Toast.show('준비 중입니다 💪', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
      });
      return;
    }
    navigation.navigate('AddComment', {
      type: 'building',
      buildingId: building.id,
      placeId: place.id,
    });
  }

  const hasPlaceAccessibility = !!accessibility?.placeAccessibility;
  const hasBuildingAccessibility = !!accessibility?.buildingAccessibility;

  function renderSection(sectionType: AccessibilitySectionType) {
    switch (sectionType) {
      case 'floor':
        return <PlaceFloorInfo key="floor" accessibility={accessibility} />;
      case 'placeEntrance':
        return (
          <View key="placeEntrance" style={{gap: 20}}>
            <PlaceEntranceStepInfo accessibility={accessibility} />
            <PlaceDoorInfo accessibility={accessibility} />
          </View>
        );
      case 'buildingEntrance':
        if (!hasBuildingAccessibility) {
          return null;
        }
        return (
          <View key="buildingEntrance" style={{gap: 20}}>
            <BuildingEntranceStepInfo accessibility={accessibility} />
            <BuildingDoorInfo accessibility={accessibility} />
          </View>
        );
      case 'elevator':
        if (!hasBuildingAccessibility) {
          return null;
        }
        return (
          <BuildingElevatorInfo key="elevator" accessibility={accessibility} />
        );
      case 'indoor':
        return null; // 내부 이용 정보는 리뷰 탭에서 표시
      default:
        return null;
    }
  }

  if (!hasPlaceAccessibility) {
    return (
      <EmptyStateContainer>
        <EmptyStateTextBlock>
          <EmptyStateTitle>
            {'아직 등록된  접근성 정보가 없어요🥲'}
          </EmptyStateTitle>
          <EmptyStateDescription>
            {'아래 버튼을 눌러주시면\n최대한 빨리 장소를 정복해볼게요!'}
          </EmptyStateDescription>
        </EmptyStateTextBlock>
        <EmptyStateCTAButton
          elementName="place_detail_accessibility_tab_empty_register"
          onPress={onRegister}>
          <PlusIcon width={20} height={20} color={color.brand40} />
          <EmptyStateCTAText>정보 등록하기</EmptyStateCTAText>
        </EmptyStateCTAButton>
        {LocationConfirmModal}
      </EmptyStateContainer>
    );
  }

  const placeImages = accessibility?.placeAccessibility?.images ?? [];
  const buildingEntranceImages =
    accessibility?.buildingAccessibility?.entranceImages ?? [];
  const buildingElevatorImages =
    accessibility?.buildingAccessibility?.elevatorImages ?? [];
  const allImages = [
    ...placeImages,
    ...buildingEntranceImages,
    ...buildingElevatorImages,
  ];

  return (
    <Container>
      {/* 매장 접근성 섹션 */}
      <S.Section>
        <S.Row>
          <S.Title>매장 접근성</S.Title>
          <S.Updated>
            {dayjs(accessibility?.placeAccessibility?.createdAt.value).format(
              'YYYY. MM. DD',
            )}
          </S.Updated>
        </S.Row>
        <ImageList images={allImages} roundCorners />

        {/* 물리적 경로 순서대로 표시 */}
        {sectionOrder.map(sectionType => renderSection(sectionType))}

        <FeedbackButton
          isUpvoted={isPlaceUpvoted}
          total={placeUpvoteCount}
          onPressUpvote={togglePlaceUpvote}
          onPressInfoUpdateRequest={() =>
            showNegativeFeedbackBottomSheet?.('PLACE_ACCESSIBILITY')
          }
          onPressAnalytics={() =>
            navigation.navigate('UpvoteAnalytics', {
              targetType: 'PLACE_ACCESSIBILITY',
              targetId: accessibility?.placeAccessibility?.id || '',
            })
          }
        />
        <SectionDivider />
        <View>
          <PlaceDetailCommentSection
            comments={accessibility?.placeAccessibilityComments}
            commentTarget="place"
            onAddComment={handlePressAddPlaceComment}
            checkAuth={checkAuth}
            title="매장 입구 정보 의견 남기기"
          />
          <PlaceDetailCrusher
            crusherGroupIcon={
              accessibility?.placeAccessibility?.challengeCrusherGroup?.icon
            }
            crusherNames={
              accessibility?.placeAccessibility?.registeredUserName
                ? [accessibility.placeAccessibility.registeredUserName]
                : []
            }
          />
        </View>
      </S.Section>

      {/* 건물 접근성 섹션 */}
      {hasBuildingAccessibility ? (
        <>
          <TabSectionDivider />
          <S.Section>
            <S.SubSection>
              <S.Row>
                <S.Title>건물 정보</S.Title>
                <S.Updated>
                  {dayjs(
                    accessibility?.buildingAccessibility?.createdAt.value,
                  ).format('YYYY. MM. DD')}
                </S.Updated>
              </S.Row>
              <S.Address>{place.address}</S.Address>
            </S.SubSection>
            <S.InfoContent>
              <BuildingEntranceStepInfo accessibility={accessibility} />
              <BuildingElevatorInfo accessibility={accessibility} />
              <BuildingDoorInfo accessibility={accessibility} />
              <FeedbackButton
                isUpvoted={isBuildingUpvoted}
                total={buildingUpvoteCount}
                onPressUpvote={toggleBuildingUpvote}
                onPressInfoUpdateRequest={() =>
                  showNegativeFeedbackBottomSheet?.('BUILDING_ACCESSIBILITY')
                }
                onPressAnalytics={() =>
                  navigation.navigate('UpvoteAnalytics', {
                    targetType: 'BUILDING_ACCESSIBILITY',
                    targetId: accessibility?.buildingAccessibility?.id || '',
                  })
                }
              />
              <SectionDivider />
              <View>
                <PlaceDetailCommentSection
                  comments={accessibility?.buildingAccessibilityComments}
                  commentTarget="building"
                  onAddComment={handlePressAddBuildingComment}
                  checkAuth={checkAuth}
                  title="건물 입구 정보 의견 남기기"
                />
                <PlaceDetailCrusher
                  crusherGroupIcon={
                    accessibility?.buildingAccessibility?.challengeCrusherGroup
                      ?.icon
                  }
                  crusherNames={
                    accessibility?.buildingAccessibility?.registeredUserName
                      ? [accessibility.buildingAccessibility.registeredUserName]
                      : []
                  }
                />
              </View>
            </S.InfoContent>
          </S.Section>
        </>
      ) : (
        // 건물정보 등록 CTA
        hasPlaceAccessibility && (
          <>
            <TabSectionDivider />
            <BuildingCTASection>
              <BuildingCTAText>
                건물 접근성 정보를 등록해주세요!
              </BuildingCTAText>
              <SccButton
                text={
                  isAccessibilityRegistrable
                    ? '건물 정보 등록하기'
                    : '서비스 지역이 아닙니다'
                }
                style={{borderRadius: 10}}
                fontSize={16}
                fontFamily={font.pretendardBold}
                isDisabled={!isAccessibilityRegistrable}
                onPress={handleBuildingRegister}
                elementName="place_detail_accessibility_tab_building_register"
              />
            </BuildingCTASection>
          </>
        )
      )}

      {allowDuplicateRegistration && isAccessibilityRegistrable && (
        <RegisterButtonContainer>
          <SccButton
            text="정보 등록하기"
            style={{borderRadius: 10}}
            fontSize={18}
            fontFamily={font.pretendardBold}
            onPress={onRegister}
            elementName="place_detail_accessibility_tab_register_v2"
          />
        </RegisterButtonContainer>
      )}

      <BottomPadding />
      {LocationConfirmModal}
    </Container>
  );
}

const Container = styled.View`
  background-color: ${color.white};
`;

const SectionDivider = styled.View`
  height: 1px;
  background-color: ${color.gray20};
`;

const TabSectionDivider = styled.View`
  height: 13px;
  background-color: ${color.gray10};
`;

const RegisterButtonContainer = styled.View`
  padding: 16px 20px;
`;

const BuildingCTASection = styled.View`
  padding: 24px 20px;
  gap: 16px;
  align-items: center;
`;

const BuildingCTAText = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -0.32px;
  color: ${color.gray80};
`;

const BottomPadding = styled.View`
  height: 100px;
`;

const EmptyStateContainer = styled.View`
  flex: 1;
  background-color: ${color.gray5};
  padding-top: 40px;
  padding-horizontal: 20px;
  padding-bottom: 20px;
  gap: 16px;
`;

const EmptyStateTextBlock = styled.View`
  gap: 8px;
  align-items: center;
`;

const EmptyStateTitle = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 18px;
  line-height: 26px;
  letter-spacing: -0.36px;
  color: ${color.gray80};
  text-align: center;
`;

const EmptyStateDescription = styled.Text`
  font-family: ${font.pretendardRegular};
  font-size: 15px;
  line-height: 24px;
  letter-spacing: -0.3px;
  color: ${color.gray50};
  text-align: center;
`;

const EmptyStateCTAButton = styled(SccTouchableOpacity)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background-color: ${color.white};
  border-width: 1px;
  border-color: ${color.brand40};
  border-radius: 8px;
  padding-vertical: 12px;
  padding-horizontal: 28px;
`;

const EmptyStateCTAText = styled.Text`
  font-family: ${font.pretendardSemibold};
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -0.32px;
  color: ${color.brand40};
`;
