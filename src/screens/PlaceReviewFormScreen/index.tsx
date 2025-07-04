import {useQuery} from '@tanstack/react-query';
import {useState} from 'react';
import {ScrollView} from 'react-native';

import {FormScreenLayout} from '@/components/FormScreenLayout';
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

  if (!placeId || typeof placeId !== 'string') {
    return null;
  }

  function renderView() {
    switch (reviewType) {
      case 'indoor':
        return (
          <IndoorReviewView
            navigation={navigation}
            place={data?.place}
            setReviewTypeToToilet={() => setReviewType('toilet')}
          />
        );
      case 'toilet':
        return <ToiletReviewView />;
    }
  }

  return (
    <LogParamsProvider params={{placeId}}>
      <FormScreenLayout>
        <ScrollView>{renderView()}</ScrollView>
      </FormScreenLayout>
    </LogParamsProvider>
  );
}
