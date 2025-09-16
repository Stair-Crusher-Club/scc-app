import React, {useState} from 'react';

import {AccessibilityInfoDto} from '@/generated-sources/openapi';
import {useCheckAuth} from '@/utils/checkAuth';

import {useDeleteAccessibility} from '../hooks/useDeleteAccessibility';
import DeleteBottomSheet from '../modals/DeleteBottomSheet';
import * as S from './PlaceDetailFeedbackSection.style';

interface PlaceDetailFeedbackSectionProps {
  accessibility: AccessibilityInfoDto;
}

export const PlaceDetailFeedbackSection = ({
  accessibility,
}: PlaceDetailFeedbackSectionProps) => {
  const deletePlaceAccessibility = useDeleteAccessibility(
    'place',
    accessibility,
  );
  const deleteBuildingAccessibility = useDeleteAccessibility(
    'building',
    accessibility,
  );

  const [isPlaceDeleteModalVisible, setIsPlaceDeleteModalVisible] =
    useState(false);
  const [isBuildingDeleteModalVisible, setIsBuildingDeleteModalVisible] =
    useState(false);
  const checkAuth = useCheckAuth();

  const showPlaceDeleteConfirmBottomSheet = () => {
    checkAuth(() => {
      setIsPlaceDeleteModalVisible(true);
    });
  };

  const showBuildingDeleteConfirmBottomSheet = () => {
    checkAuth(() => {
      setIsBuildingDeleteModalVisible(true);
    });
  };

  const isPlaceDeletable = !!accessibility.placeAccessibility?.isDeletable; // FIXME: login check
  const isBuildingDeletable =
    !!accessibility.buildingAccessibility?.isDeletable;

  if (!(isPlaceDeletable || isBuildingDeletable)) {
    return null;
  }

  return (
    <S.PlaceDetailFeedbackSection>
      <S.SectionTitle>이 정보를 삭제할까요?</S.SectionTitle>
      {isPlaceDeletable && (
        <S.Buttons>
          <S.DeleteButton
            elementName="place_detail_delete_place_button"
            onPress={showPlaceDeleteConfirmBottomSheet}>
            <S.DeleteButtonText>장소 정보 삭제하기</S.DeleteButtonText>
          </S.DeleteButton>
        </S.Buttons>
      )}
      {isBuildingDeletable && (
        <S.Buttons>
          <S.DeleteButton
            elementName="place_detail_delete_building_button"
            style={{marginTop: 16}}
            onPress={showBuildingDeleteConfirmBottomSheet}>
            <S.DeleteButtonText>건물 정보 삭제하기</S.DeleteButtonText>
          </S.DeleteButton>
        </S.Buttons>
      )}
      <DeleteBottomSheet
        isVisible={isPlaceDeleteModalVisible}
        confirmText={
          '이 장소의 계단정보와 댓글이 모두 삭제됩니다. 정말 삭제할까요?'
        }
        onPressCancelButton={() => setIsPlaceDeleteModalVisible(false)}
        onPressConfirmButton={() => {
          deletePlaceAccessibility.mutate();
          setIsPlaceDeleteModalVisible(false);
        }}
      />
      <DeleteBottomSheet
        isVisible={isBuildingDeleteModalVisible}
        confirmText={
          '이 건물의 계단정보와 댓글이 모두 삭제됩니다. 정말 삭제할까요?'
        }
        onPressCancelButton={() => setIsBuildingDeleteModalVisible(false)}
        onPressConfirmButton={() => {
          deleteBuildingAccessibility.mutate();
          setIsBuildingDeleteModalVisible(false);
        }}
      />
    </S.PlaceDetailFeedbackSection>
  );
};
