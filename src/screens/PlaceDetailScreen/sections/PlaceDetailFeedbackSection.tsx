import {default as React, useState} from 'react';
import {Platform} from 'react-native';
import Toast from 'react-native-root-toast';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {AccessibilityInfoV2Dto} from '@/generated-sources/openapi';
import {useCheckAuth} from '@/utils/checkAuth';

import {useDeleteAccessibility} from '../hooks/useDeleteAccessibility';
import DeleteBottomSheet from '../modals/DeleteBottomSheet';
import * as S from './PlaceDetailFeedbackSection.style';

interface PlaceDetailFeedbackSectionProps {
  placeId: string;
  accessibility: AccessibilityInfoV2Dto | undefined;
}

export const PlaceDetailFeedbackSection = ({
  placeId,
  accessibility,
}: PlaceDetailFeedbackSectionProps) => {
  const deletePlaceAccessibility = useDeleteAccessibility(
    'place',
    placeId,
    accessibility,
  );
  const deleteBuildingAccessibility = useDeleteAccessibility(
    'building',
    placeId,
    accessibility,
  );

  const [isPlaceDeleteModalVisible, setIsPlaceDeleteModalVisible] =
    useState(false);
  const [isBuildingDeleteModalVisible, setIsBuildingDeleteModalVisible] =
    useState(false);
  const checkAuth = useCheckAuth();

  const showPlaceDeleteConfirmBottomSheet = () => {
    if (Platform.OS === 'web') {
      Toast.show('준비 중입니다 💪', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
      });
      return;
    }
    checkAuth(() => {
      setIsPlaceDeleteModalVisible(true);
    });
  };

  const showBuildingDeleteConfirmBottomSheet = () => {
    if (Platform.OS === 'web') {
      Toast.show('준비 중입니다 💪', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
      });
      return;
    }
    checkAuth(() => {
      setIsBuildingDeleteModalVisible(true);
    });
  };

  if (
    !deletePlaceAccessibility.isDeletable &&
    !deleteBuildingAccessibility.isDeletable
  ) {
    return null;
  }

  return (
    <>
      <SectionSeparator />
      <S.PlaceDetailFeedbackSection>
        <S.SectionTitle>이 정보를 삭제할까요?</S.SectionTitle>
        {deletePlaceAccessibility.isDeletable && (
          <S.Buttons>
            <S.DeleteButton
              elementName="place_detail_delete_place_button"
              onPress={showPlaceDeleteConfirmBottomSheet}>
              <S.DeleteButtonText>장소 정보 삭제하기</S.DeleteButtonText>
            </S.DeleteButton>
          </S.Buttons>
        )}
        {deleteBuildingAccessibility.isDeletable && (
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
    </>
  );
};

const SectionSeparator = styled.View`
  height: 6px;
  background-color: ${color.gray5};
`;
