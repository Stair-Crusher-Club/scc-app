import {useQuery} from '@tanstack/react-query';
import {useState} from 'react';

import {ScreenLayout} from '@/components/ScreenLayout';
import {color} from '@/constant/color';
import {UserMobilityToolMapDto} from '@/constant/review';
import {Building, Place} from '@/generated-sources/openapi';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import {ScreenProps} from '@/navigation/Navigation.screens';

import IndoorReviewView from './views/IndoorReviewView';
import ToiletReviewView from './views/ToiletReviewView';

export interface PlaceReviewFormScreenParams {
  placeId?: string;
}

export default function PlaceReviewFormScreen({
  route,
  navigation,
}: ScreenProps<'ReviewForm/Place'>) {
  const placeId = route.params?.placeId;
  const {data} = useQuery<{
    place?: Place;
    building?: Building;
    isAccessibilityRegistrable?: boolean;
    accessibilityScore?: number;
  }>({
    queryKey: ['PlaceDetail', placeId],
  });
  const [reviewType, setReviewType] = useState<'indoor' | 'toilet'>('indoor');
  const [mobilityTool, setMobilityTool] = useState<UserMobilityToolMapDto>();

  if (!placeId || typeof placeId !== 'string') {
    return null;
  }

  function gotoPlaceDetail() {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

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
        isHeaderVisible={true}
        style={{backgroundColor: color.white}}>
        {renderView()}
      </ScreenLayout>
    </LogParamsProvider>
  );
}
