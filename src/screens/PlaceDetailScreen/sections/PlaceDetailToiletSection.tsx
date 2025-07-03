import dayjs from 'dayjs';
import React from 'react';
import {View} from 'react-native';
import styled from 'styled-components/native';

import PlusIcon from '@/assets/icon/ic_plus.svg';
import {SccButton} from '@/components/atoms';
import {CommentBlock} from '@/components/molecules';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {
  AccessibilityInfoDto,
  Building,
  Place,
} from '@/generated-sources/openapi';
import {LogClick} from '@/logging/LogClick';
import useNavigation from '@/navigation/useNavigation';
import PlaceToiletInfo from '@/screens/PlaceDetailScreen/components/PlaceToiletInfo';
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
}

export default function PlaceDetailToiletSection({accessibility}: Props) {
  const checkAuth = useCheckAuth();
  if (!accessibility?.buildingAccessibility) {
    return null;
  }

  const {entranceImages, elevatorImages, registeredUserName, createdAt} =
    accessibility.buildingAccessibility;
  const images = [...(entranceImages ?? []), ...(elevatorImages ?? [])];
  const comments = accessibility.buildingAccessibilityComments;

  function handlePressAddComment() {
    // navigation.navigate('AddComment', {
    //   type: 'building',
    //   buildingId: building.id,
    //   placeId: place.id,
    // });
  }

  return (
    <S.Section>
      <S.SubSection>
        <S.Title>장애인 화장실 정보</S.Title>
      </S.SubSection>
      <S.InfoContent>
        <ImageList images={images} roundCorners />
        <PlaceToiletInfo accessibility={accessibility} />
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
