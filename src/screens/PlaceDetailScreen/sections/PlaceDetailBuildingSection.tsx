import dayjs from 'dayjs';
import React from 'react';
import {View} from 'react-native';
import styled from 'styled-components/native';

import {SccButton} from '@/components/atoms';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  AccessibilityInfoDto,
  Building,
  Place,
} from '@/generated-sources/openapi';
import useNavigation from '@/navigation/useNavigation';
import {useCheckAuth} from '@/utils/checkAuth';

import BuildingDoorInfo from '../components/BuildingDoorInfo';
import BuildingElevatorInfo from '../components/BuildingElevatorInfo';
import BuildingEntranceStepInfo from '../components/BuildingEntranceStepInfo';
import PlaceDetailCommentSection from '../components/PlaceDetailCommentSection';
import ImageList from '../components/PlaceDetailImageList';
import PlaceDetailCrusher from './PlaceDetailCrusher';
import * as S from './PlaceDetailEntranceSection.style';

interface Props {
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
}: Props) {
  const navigation = useNavigation();
  const checkAuth = useCheckAuth();
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
        <Divider />
        <View>
          <PlaceDetailCommentSection
            comments={comments}
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
          onPress={() =>
            checkAuth(() =>
              navigation.navigate('BuildingForm', {place, building}),
            )
          }
        />
      </S.EmptyInfoContent>
    </S.Section>
  );
}
