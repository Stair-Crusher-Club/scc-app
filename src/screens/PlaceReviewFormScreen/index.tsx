import {useQuery} from '@tanstack/react-query';
import {useState} from 'react';
import {ScrollView} from 'react-native';

import {ScreenLayout} from '@/components/ScreenLayout';
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
  const [reviewType, setReviewType] = useState<'indoor' | 'toilet'>('toilet');

  if (!placeId || typeof placeId !== 'string') {
    return null;
  }

  function gotoPlaceDetail() {
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
            setReviewTypeToToilet={() => setReviewType('toilet')}
          />
        );
      case 'toilet':
        return (
          <ToiletReviewView
            place={data?.place}
            gotoPlaceDetail={gotoPlaceDetail}
          />
        );
    }
  }

  return (
    <LogParamsProvider params={{placeId}}>
      <ScreenLayout isHeaderVisible={true}>
        <ScrollView contentContainerStyle={{flexGrow: 1}}>
          {renderView()}
        </ScrollView>
      </ScreenLayout>
    </LogParamsProvider>
  );
}
