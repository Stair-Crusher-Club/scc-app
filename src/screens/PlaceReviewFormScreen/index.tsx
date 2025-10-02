import {useQuery} from '@tanstack/react-query';
import React, {useState} from 'react';

import {ScreenLayout} from '@/components/ScreenLayout';
import {color} from '@/constant/color';
import {UserMobilityToolMapDto} from '@/constant/review';
import {Building, Place} from '@/generated-sources/openapi';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import {ScreenProps} from '@/navigation/Navigation.screens';

import useAppComponents from '@/hooks/useAppComponents';
import IndoorReviewView from './views/IndoorReviewView';
import ToiletReviewView from './views/ToiletReviewView';

export interface PlaceReviewFormScreenParams {
  placeId?: string;
}

export default function PlaceReviewFormScreen({
  route,
  navigation,
}: ScreenProps<'ReviewForm/Place'>) {
  const {api} = useAppComponents();

  const placeId = route.params?.placeId;
  const {data} = useQuery<{
    place?: Place;
    building?: Building;
    isAccessibilityRegistrable?: boolean;
    accessibilityScore?: number;
  }>({
    queryKey: ['PlaceDetail', placeId],
    queryFn: async () => {
      const result = await api.getPlaceWithBuildingPost({
        placeId: placeId ?? '',
      });
      return {
        place: result.data.place,
        building: result.data.building,
        isAccessibilityRegistrable: result.data.isAccessibilityRegistrable,
        accessibilityScore: result.data.accessibilityInfo?.accessibilityScore,
      };
    },
  });
  const [reviewType, setReviewType] = useState<'indoor' | 'toilet'>('indoor');
  const [mobilityTool, setMobilityTool] = useState<UserMobilityToolMapDto>();

  if (!placeId || typeof placeId !== 'string') {
    return null;
  }

  function gotoPlaceDetail() {
    const state = navigation.getState();
    const currentRouteIndex = state.index;
    const previousRoute =
      currentRouteIndex > 0 ? state.routes[currentRouteIndex - 1] : null;

    // 이전 화면이 PlaceDetail인 경우에만 goBack 사용
    if (navigation.canGoBack() && previousRoute?.name === 'PlaceDetail') {
      navigation.goBack();
      return;
    }

    // 이전 화면이 PlaceDetail이 아니거나 없는 경우 replace 사용
    navigation.replace('PlaceDetail', {
      placeInfo: {
        placeId: data?.place?.id!,
      },
    });
  }

  function renderView() {
    switch (reviewType) {
      case 'indoor':
        return (
          <IndoorReviewView
            place={data?.place}
            gotoPlaceDetail={gotoPlaceDetail}
            setMobilityTool={setMobilityTool}
            setReviewTypeToToilet={() => setReviewType('toilet')}
          />
        );
      case 'toilet':
        return (
          <ToiletReviewView
            place={data?.place}
            gotoPlaceDetail={gotoPlaceDetail}
            mobilityTool={mobilityTool}
          />
        );
    }
  }

  return (
    <LogParamsProvider params={{placeId}}>
      <ScreenLayout
        safeAreaEdges={['bottom']}
        isHeaderVisible={true}
        style={{backgroundColor: color.white}}>
        {renderView()}
      </ScreenLayout>
    </LogParamsProvider>
  );
}
