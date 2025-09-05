import React from 'react';

import BuildingIcon from '@/assets/icon/ic_building.svg';
import {SccButton} from '@/components/atoms';
import {font} from '@/constant/font';
import {Building, Place} from '@/generated-sources/openapi';
import useNavigation from '@/navigation/useNavigation';
import {useCheckAuth} from '@/utils/checkAuth';

import * as S from './PlaceDetailNoBuildingSection.style';

interface PlaceDetailPlaceSectionProps {
  place: Place;
  building: Building;
}

const PlaceDetailNoBuildingSection = ({
  place,
  building,
}: PlaceDetailPlaceSectionProps) => {
  const navigation = useNavigation();
  const checkAuth = useCheckAuth();

  const goToRegisterBuilding = () => {
    checkAuth(() => {
      navigation.navigate('BuildingForm', {place, building});
    });
  };

  return (
    <S.PlaceDetailNoBuildingSection>
      <S.Title>이 곳의 건물 정보</S.Title>
      <S.Description>{place.address}</S.Description>
      <S.NoBuildingCard>
        <S.CardHeader>
          <BuildingIcon width={38} height={38} />
          <S.CardTitle>
            {'아직 정복되지 않은 건물입니다.\n지금 바로 정복할까요?'}
          </S.CardTitle>
        </S.CardHeader>
        <SccButton
          text="건물 정복하기"
          fontFamily={font.pretendardBold}
          onPress={goToRegisterBuilding}
          elementName="place_detail_conquer_building"
        />
      </S.NoBuildingCard>
    </S.PlaceDetailNoBuildingSection>
  );
};

export default PlaceDetailNoBuildingSection;
