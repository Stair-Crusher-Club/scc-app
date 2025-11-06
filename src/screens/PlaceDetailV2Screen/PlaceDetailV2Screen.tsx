import {Building, Place} from '@/generated-sources/openapi';
import {BuildingRegistrationEvent} from './constants';

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

export default function PlaceDetailV2Screen() {
  return null;
}
