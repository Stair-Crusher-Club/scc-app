import dayjs from 'dayjs';
import React from 'react';
import {Platform, View} from 'react-native';
import Toast from 'react-native-root-toast';
import styled from 'styled-components/native';

import {SccButton} from '@/components/atoms';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  AccessibilityInfoDto,
  Building,
  Place,
} from '@/generated-sources/openapi';
import {useUpvoteToggle} from '@/hooks/useUpvoteToggle';
import useNavigation from '@/navigation/useNavigation';
import {useCheckAuth} from '@/utils/checkAuth';
import {getFormScreenVersion} from '@/utils/accessibilityFlags';

import FeedbackButton from '@/components/FeedbackButton';
import BuildingDoorInfo from '../components/BuildingDoorInfo';
import BuildingElevatorInfo from '../components/BuildingElevatorInfo';
import BuildingEntranceStepInfo from '../components/BuildingEntranceStepInfo';
import PlaceDetailCommentSection from '../components/PlaceDetailCommentSection';
import ImageList from '../components/PlaceDetailImageList';
import {UserInteractionHandlers} from '../types';
import PlaceDetailCrusher from './PlaceDetailCrusher';
import * as S from './PlaceDetailEntranceSection.style';

interface Props extends UserInteractionHandlers {
  accessibility?: AccessibilityInfoDto;
  place: Place;
  building: Building;
  isAccessibilityRegistrable?: boolean;
}

export default function PlaceDetailBuildingSection({
  accessibility,
  place,
  building,
  isAccessibilityRegistrable,
  showNegativeFeedbackBottomSheet,
}: Props) {
  const navigation = useNavigation();
  const checkAuth = useCheckAuth();

  const {isUpvoted, totalUpvoteCount, toggleUpvote} = useUpvoteToggle({
    initialIsUpvoted: accessibility?.buildingAccessibility?.isUpvoted ?? false,
    initialTotalCount: accessibility?.buildingAccessibility?.totalUpvoteCount,
    targetId: accessibility?.buildingAccessibility?.id,
    targetType: 'BUILDING_ACCESSIBILITY',
    placeId: place.id,
  });

  if (!accessibility?.buildingAccessibility) {
    return (
      <NoBuildingInfoSection
        place={place}
        building={building}
        isAccessibilityRegistrable={isAccessibilityRegistrable ?? false}
      />
    );
  }

  const {entranceImages, elevatorImages, registeredUserName, createdAt} =
    accessibility.buildingAccessibility;
  const images = [...(entranceImages ?? []), ...(elevatorImages ?? [])];
  const comments = accessibility.buildingAccessibilityComments;

  function handlePressAddComment() {
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

  return (
    <S.Section>
      <S.SubSection>
        <S.Row>
          <S.Title>건물 정보</S.Title>
          <S.Updated>{dayjs(createdAt.value).format('YYYY. MM. DD')}</S.Updated>
        </S.Row>
        <S.Address>{place.address}</S.Address>
      </S.SubSection>
      <S.InfoContent>
        <ImageList images={images} roundCorners />
        <BuildingEntranceStepInfo accessibility={accessibility} />
        <BuildingElevatorInfo accessibility={accessibility} />
        <BuildingDoorInfo accessibility={accessibility} />
        <FeedbackButton
          isUpvoted={isUpvoted}
          total={totalUpvoteCount}
          onPressUpvote={toggleUpvote}
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
        <Divider />
        <View>
          <PlaceDetailCommentSection
            comments={comments}
            commentTarget="building"
            onAddComment={handlePressAddComment}
            checkAuth={checkAuth}
            title="건물 입구 정보 의견 남기기"
          />
          <PlaceDetailCrusher
            crusherGroupIcon={
              accessibility.buildingAccessibility?.challengeCrusherGroup?.icon
            }
            crusherNames={registeredUserName ? [registeredUserName] : []}
          />
        </View>
      </S.InfoContent>
    </S.Section>
  );
}

const Divider = styled.View({height: 1, backgroundColor: color.gray20});

function NoBuildingInfoSection({
  place,
  building,
  isAccessibilityRegistrable,
}: {
  place: Place;
  building: Building;
  isAccessibilityRegistrable: boolean;
}) {
  const navigation = useNavigation();
  const checkAuth = useCheckAuth();

  const handleBuildingRegister = () => {
    if (Platform.OS === 'web') {
      Toast.show('준비 중입니다 💪', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
      });
      return;
    }
    checkAuth(() => {
      const formVersion = getFormScreenVersion();
      if (formVersion === 'v2') {
        navigation.navigate('BuildingFormV2', {place, building});
        return;
      }
      navigation.navigate('BuildingForm', {place, building});
    });
  };

  return (
    <S.Section>
      <S.SubSection>
        <S.Row>
          <S.Title>건물 정보</S.Title>
        </S.Row>
        <S.Address>{place.address}</S.Address>
      </S.SubSection>
      <S.EmptyInfoContent>
        <ImageList images={[]} roundCorners />
        <BuildingEntranceStepInfo />
        <BuildingElevatorInfo />
        <BuildingDoorInfo />
        <SccButton
          text={
            isAccessibilityRegistrable
              ? '정보 등록하기'
              : '서비스 지역이 아닙니다'
          }
          style={{
            borderRadius: 10,
          }}
          fontSize={18}
          fontFamily={font.pretendardBold}
          isDisabled={!isAccessibilityRegistrable}
          onPress={handleBuildingRegister}
          elementName="place_detail_building_register"
        />
      </S.EmptyInfoContent>
    </S.Section>
  );
}
