import {useQuery} from '@tanstack/react-query';
import React, {useCallback, useEffect, useState} from 'react';
import {ScrollView} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import {ScreenLayout} from '@/components/ScreenLayout';
import {Building, Place} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import {ScreenProps} from '@/navigation/Navigation.screens';

import * as S from './PlaceDetailScreen.style';
import RegisterCompleteBottomSheet from './modals/RegisterCompleteBottomSheet';
import RequireBuildingAccessibilityBottomSheet from './modals/RequireBuildingAccessibilityBottomSheet';
import PlaceDetailAppBar from './sections/PlaceDetailAppBar';
import PlaceDetailBuildingSection from './sections/PlaceDetailBuildingSection';
import PlaceDetailCoverImage from './sections/PlaceDetailCoverImage';
import PlaceDetailEntranceSection from './sections/PlaceDetailEntranceSection';
import {PlaceDetailFeedbackSection} from './sections/PlaceDetailFeedbackSection';
import PlaceDetailSummarySection from './sections/PlaceDetailSummarySection';

export interface PlaceDetailScreenParams {
  placeInfo:
    | {placeId: string}
    | {
        place: Place;
        building: Building;
        isAccessibilityRegistrable?: boolean;
        accessibilityScore?: number;
      };
  event?: 'submit-place' | 'submit-building';
}

const PlaceDetailScreen = ({route, navigation}: ScreenProps<'PlaceDetail'>) => {
  const {event, placeInfo} = route.params;
  const {api} = useAppComponents();

  const placeId =
    'placeId' in placeInfo ? placeInfo.placeId : placeInfo.place.id;

  const [
    showRequireBuildingAccessibilityBottomSheet,
    setShowRequireBuildingAccessibilityBottomSheet,
  ] = useState(false);
  const [showRegisterCompleteBottomSheet, setShowRegisterCompleteBottomSheet] =
    useState(false);

  const {data} = useQuery({
    initialData: {
      place: 'place' in placeInfo ? placeInfo.place : undefined,
      building: 'building' in placeInfo ? placeInfo.building : undefined,
      isAccessibilityRegistrable:
        'isAccessibilityRegistrable' in placeInfo
          ? placeInfo.isAccessibilityRegistrable
          : undefined,
      accessibilityScore:
        'accessibilityScore' in placeInfo
          ? placeInfo.accessibilityScore
          : undefined,
    },
    queryKey: ['PlaceDetail', placeId],
    queryFn: async ({queryKey}) => {
      const result = await api.getPlaceWithBuildingPost({placeId: queryKey[1]});
      return {
        place: result.data.place,
        building: result.data.building,
        isAccessibilityRegistrable: result.data.isAccessibilityRegistrable,
        accessibilityScore: result.data.accessibilityInfo?.accessibilityScore,
      };
    },
  });
  const place = data?.place;
  const building = data?.building;

  const {data: accessibilityPost, isLoading} = useQuery({
    queryKey: ['PlaceAccessibility', placeId],
    queryFn: async ({queryKey}) =>
      (await api.getAccessibilityPost({placeId: queryKey[1]})).data,
  });

  useEffect(() => {
    // 등록된 정보 확인 후에 띄워주기
    if (!accessibilityPost) {
      return;
    }

    // open by event
    if (event === 'submit-place') {
      // 건물 정보가 이미 있는 경우, 정복 완료로 보여주기
      if (accessibilityPost.buildingAccessibility) {
        setShowRegisterCompleteBottomSheet(true);
      } else {
        setShowRequireBuildingAccessibilityBottomSheet(true);
      }
    }
    if (event === 'submit-building') {
      setShowRegisterCompleteBottomSheet(true);
    }
  }, [accessibilityPost, event, placeId]);

  const closeModals = useCallback(() => {
    // 일단 둘밖에 없으니 둘 다 닫는걸로 처리하자
    setShowRequireBuildingAccessibilityBottomSheet(false);
    setShowRegisterCompleteBottomSheet(false);
    // 복귀 후 모달을 다시 띄우지 않기 위한 처리
    navigation.setParams({event: undefined});
  }, [navigation]);

  const goToBuildingForm = useCallback(() => {
    closeModals();
    if (place && building) {
      navigation.navigate('BuildingForm', {place, building});
    }
  }, [building, closeModals, navigation, place]);

  if (isLoading || !place || !building) {
    return null;
  }

  return (
    <LogParamsProvider params={{place_id: place.id, building_id: building.id}}>
      <ScreenLayout isHeaderVisible={false} safeAreaEdges={['bottom']}>
        {/* 안드로이드 이미지 캐로셀 이슈 */}
        <GestureHandlerRootView style={{flex: 1}}>
          <ScrollView>
            <PlaceDetailAppBar />
            <PlaceDetailCoverImage accessibility={accessibilityPost} />
            <PlaceDetailSummarySection
              accessibility={accessibilityPost}
              accessibilityScore={data?.accessibilityScore}
              place={place}
            />
            <S.SectionSeparator />
            <PlaceDetailEntranceSection
              accessibility={accessibilityPost}
              place={place}
            />
            <S.SectionSeparator />
            <PlaceDetailBuildingSection
              accessibility={accessibilityPost}
              place={place}
              building={building}
              isAccessibilityRegistrable={data?.isAccessibilityRegistrable}
            />
            {accessibilityPost && accessibilityPost?.placeAccessibility && (
              <>
                <S.SectionSeparator />
                <PlaceDetailFeedbackSection accessibility={accessibilityPost} />
              </>
            )}
          </ScrollView>
        </GestureHandlerRootView>
        <RequireBuildingAccessibilityBottomSheet
          isVisible={showRequireBuildingAccessibilityBottomSheet}
          isFirstFloor={accessibilityPost?.placeAccessibility?.isFirstFloor}
          onPressConfirmButton={goToBuildingForm}
          onPressCloseButton={closeModals}
        />
        <RegisterCompleteBottomSheet
          isVisible={showRegisterCompleteBottomSheet}
          accessibilityPost={accessibilityPost}
          event={event}
          onPressConfirmButton={closeModals}
        />
      </ScreenLayout>
    </LogParamsProvider>
  );
};

export default PlaceDetailScreen;
