import {useQuery} from '@tanstack/react-query';
import {ScrollView} from 'react-native-gesture-handler';

import {ScreenLayout} from '@/components/ScreenLayout';
import {Building, Place} from '@/generated-sources/openapi';
import {LogParamsProvider} from '@/logging/LogParamsProvider';
import {ScreenProps} from '@/navigation/Navigation.screens';

import ToiletReviewView from '../PlaceReviewFormScreen/views/ToiletReviewView';

export interface ToiletReviewFormScreenParams {
  placeId?: string;
}

export default function ToiletReviewFormScreen({
  route,
  navigation,
}: ScreenProps<'ReviewForm/Toilet'>) {
  const placeId = route.params?.placeId;
  const {data} = useQuery<{
    place?: Place;
    building?: Building;
    isAccessibilityRegistrable?: boolean;
    accessibilityScore?: number;
  }>({
    queryKey: ['PlaceDetail', placeId],
  });

  function gotoPlaceDetail() {
    navigation.replace('PlaceDetail', {
      placeInfo: {
        placeId: data?.place?.id!,
      },
    });
  }

  return (
    <LogParamsProvider params={{placeId}}>
      <ScreenLayout isHeaderVisible={true}>
        <ScrollView contentContainerStyle={{flexGrow: 1}}>
          <ToiletReviewView
            place={data?.place}
            gotoPlaceDetail={gotoPlaceDetail}
          />
        </ScrollView>
      </ScreenLayout>
    </LogParamsProvider>
  );
}
