import React from 'react';
import {View} from 'react-native';

import {AccessibilityInfoDto} from '@/generated-sources/openapi';
import PlaceToiletInfo from '@/screens/PlaceDetailScreen/components/PlaceToiletInfo';
import {useCheckAuth} from '@/utils/checkAuth';

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

  const {entranceImages, elevatorImages, registeredUserName} =
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
