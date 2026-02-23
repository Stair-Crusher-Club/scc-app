import React from 'react';
import {useQuery} from '@tanstack/react-query';

import {ScreenLayout} from '@/components/ScreenLayout';
import {color} from '@/constant/color';
import {Building, Place} from '@/generated-sources/openapi';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import {ScreenProps} from '@/navigation/Navigation.screens';

import useAppComponents from '@/hooks/useAppComponents';
import {usePlaceDetailScreenName} from '@/hooks/useFeatureFlags';
import ToiletReviewView from '../PlaceReviewFormScreen/views/ToiletReviewView';

export interface ToiletReviewFormScreenParams {
  placeId?: string;
}

export default function ToiletReviewFormScreen({
  route,
  navigation,
}: ScreenProps<'ReviewForm/Toilet'>) {
  const {api} = useAppComponents();
  const pdpScreen = usePlaceDetailScreenName();

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

  function gotoPlaceDetail() {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.replace(pdpScreen, {
      placeInfo: {
        placeId: data?.place?.id!,
      },
    });
  }

  return (
    <LogParamsProvider params={{placeId}}>
      <ScreenLayout
        isHeaderVisible={true}
        style={{backgroundColor: color.white}}>
        <ToiletReviewView
          place={data?.place}
          gotoPlaceDetail={gotoPlaceDetail}
        />
      </ScreenLayout>
    </LogParamsProvider>
  );
}
