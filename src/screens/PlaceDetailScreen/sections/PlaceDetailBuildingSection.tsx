import dayjs from 'dayjs';
import React from 'react';

import PlusIcon from '@/assets/icon/ic_plus.svg';
import {SccButton} from '@/components/atoms';
import {CommentBlock} from '@/components/molecules';
import {font} from '@/constant/font';
import {
  AccessibilityInfoDto,
  Building,
  Place,
} from '@/generated-sources/openapi';
import {LogClick} from '@/logging/LogClick';
import useNavigation from '@/navigation/useNavigation';
import {useCheckAuth} from '@/utils/checkAuth';

import BuildingDoorInfo from '../components/BuildingDoorInfo';
import BuildingElevatorInfo from '../components/BuildingElevatorInfo';
import BuildingEntranceStepInfo from '../components/BuildingEntranceStepInfo';
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

  const isBuildingInfoAvailable = !!accessibility?.buildingAccessibility;

  const handlePressAddComment = () => {
    navigation.navigate('AddComment', {type: 'building', id: place.id});
  };

  const handleRegisterInfo = () => {
    checkAuth(() => navigation.navigate('BuildingForm', {place, building}));
  };

  const {entranceImages, elevatorImages, registeredUserName, createdAt} =
    accessibility?.buildingAccessibility || {};
  const images = [...(entranceImages ?? []), ...(elevatorImages ?? [])];
  const comments = accessibility?.buildingAccessibilityComments || [];

  return (
    <S.Section>
      <S.SubSection>
        <S.Row>
          <S.Title>건물 정보</S.Title>
          {isBuildingInfoAvailable && (
            <S.Updated>
              {dayjs(createdAt?.value).format('YYYY. MM. DD')}
            </S.Updated>
          )}
        </S.Row>
        <S.Address>{place.address}</S.Address>
      </S.SubSection>
      <ImageList images={isBuildingInfoAvailable ? images : []} />
      <BuildingEntranceStepInfo accessibility={accessibility} />
      <BuildingElevatorInfo accessibility={accessibility} />
      <BuildingDoorInfo accessibility={accessibility} />
      {isBuildingInfoAvailable ? (
        <S.Comments>
          {comments.map(comment => (
            <CommentBlock key={comment.id} info={comment} />
          ))}
          <LogClick elementName="place_detail_add_comment_button">
            <S.AddCommentButton
              onPress={() => checkAuth(() => handlePressAddComment())}>
              <PlusIcon width={12} height={12} />
              <S.AddCommentText>의견 추가하기</S.AddCommentText>
            </S.AddCommentButton>
          </LogClick>
        </S.Comments>
      ) : (
        <SccButton
          text={
            isAccessibilityRegistrable
              ? '정보 등록하기'
              : '서비스 지역이 아닙니다'
          }
          fontFamily={font.pretendardBold}
          isDisabled={!isAccessibilityRegistrable}
          onPress={handleRegisterInfo}
        />
      )}
      {isBuildingInfoAvailable && (
        <PlaceDetailCrusher
          crusherGroupIcon={
            accessibility.buildingAccessibility?.challengeCrusherGroup?.icon
          }
          crusherName={registeredUserName}
        />
      )}
    </S.Section>
  );
}
