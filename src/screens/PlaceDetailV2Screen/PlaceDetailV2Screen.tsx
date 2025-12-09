import {SccButton} from '@/components/atoms';
import {Building, Place} from '@/generated-sources/openapi';
import {ScreenProps} from '@/navigation/Navigation.screens';
import {useFormScreenVersion} from '@/utils/accessibilityFlags';
import {useEffect, useState} from 'react';
import {BuildingRegistrationEvent} from './constants';
import BuildingRegistrationBottomSheet from './modals/BuildingRegistrationBottomSheet';

export interface PlaceDetailV2ScreenParams {
  placeInfo:
    | {placeId: string}
    | {
        place: Place;
        building: Building;
        isAccessibilityRegistrable?: boolean;
        accessibilityScore?: number;
      };
  event?: BuildingRegistrationEvent;
}

export default function PlaceDetailV2Screen({
  route,
  navigation,
}: ScreenProps<'PlaceDetailV2'>) {
  const {placeInfo, event} = route.params;
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const formVersion = useFormScreenVersion();

  useEffect(() => {
    // event가 있을 경우에만 바텀시트 표시
    if (event) {
      setIsBottomSheetVisible(true);
    }
  }, [event]);

  const handleConfirm = () => {
    setIsBottomSheetVisible(false);

    // placeInfo에 place와 building이 있는 경우에만 BuildingForm으로 이동
    if ('place' in placeInfo && 'building' in placeInfo) {
      if (formVersion === 'v2') {
        navigation.navigate('BuildingFormV2', {
          place: placeInfo.place,
          building: placeInfo.building,
        });
        return;
      }
      navigation.navigate('BuildingForm', {
        place: placeInfo.place,
        building: placeInfo.building,
      });
    }
  };

  const handleCancel = () => {
    setIsBottomSheetVisible(false);
  };

  return (
    <>
      {/* TODO: PlaceDetailV2 화면 구현 */}
      {event && (
        <BuildingRegistrationBottomSheet
          isVisible={isBottomSheetVisible}
          event={event}
          onPressConfirm={handleConfirm}
          onPressCancel={handleCancel}
        />
      )}

      <SccButton
        elementName="back"
        text="홈으로"
        onPress={() => {
          navigation.navigate('Main');
        }}
      />
      <SccButton
        elementName="back"
        text="뒤로가기"
        onPress={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
            return;
          }

          navigation.navigate('Setting');
        }}
      />
    </>
  );
}
