import {SccButton} from '@/components/atoms';
import {Building, Place} from '@/generated-sources/openapi';
import {ScreenProps} from '@/navigation/Navigation.screens';
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
  navigation: _navigation,
}: ScreenProps<'PlaceDetailV2'>) {
  const {placeInfo: _placeInfo, event} = route.params;
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);

  useEffect(() => {
    // event가 있을 경우에만 바텀시트 표시
    if (event) {
      setIsBottomSheetVisible(true);
    }
  }, [event]);

  const handleConfirm = () => {
    setIsBottomSheetVisible(false);
    // TODO: 건물 등록 화면으로 이동
    // navigation.navigate('BuildingFormScreen', { ... });
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
          _navigation.navigate('Main');
        }}
      />
      <SccButton
        elementName="back"
        text="뒤로가기"
        onPress={() => {
          if (_navigation.canGoBack()) {
            _navigation.goBack();
            return;
          }

          _navigation.navigate('Setting');
        }}
      />
    </>
  );
}
