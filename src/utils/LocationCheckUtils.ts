import {Location} from '@/generated-sources/openapi';
import {distanceInMeter} from '@/utils/DistanceUtils';
import GeolocationUtils from '@/utils/GeolocationUtils';

/**
 * Location 타입을 distanceInMeter 함수에서 사용하는 좌표 타입으로 변환
 */
export function convertLocationToCoordinates(location: Location): {
  latitude: number;
  longitude: number;
} {
  return {
    latitude: location.lat,
    longitude: location.lng,
  };
}

/**
 * 현재 위치와 대상 위치 간의 거리를 계산
 * @param targetLocation 대상 위치
 * @returns 거리(미터), 현재 위치를 가져올 수 없거나 대상 위치가 없으면 undefined
 */
export async function getDistanceFromCurrentLocation(
  targetLocation?: Location,
): Promise<number | undefined> {
  // targetLocation이 없으면 undefined 반환
  if (!targetLocation) {
    return undefined;
  }

  try {
    // 현재 위치 가져오기
    const currentPosition = await GeolocationUtils.getCurrentPosition();
    const currentLocation = {
      latitude: currentPosition.coords.latitude,
      longitude: currentPosition.coords.longitude,
    };

    // 거리 계산
    const distance = distanceInMeter(
      currentLocation,
      convertLocationToCoordinates(targetLocation),
    );

    return distance;
  } catch (e) {
    // 현재 위치를 가져올 수 없으면 undefined 반환
    return undefined;
  }
}
