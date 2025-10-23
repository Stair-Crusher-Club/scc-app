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
 * 현재 위치와 대상 위치 간의 거리를 체크하여 100m 이내인지 확인
 * @param targetLocation 대상 위치
 * @returns isWithin100m: 100m 이내 여부, distance: 거리(미터)
 */
export async function checkDistanceFromCurrentLocation(
  targetLocation?: Location,
): Promise<{isWithin100m: boolean; distance?: number}> {
  // targetLocation이 없으면 거리가 먼 것으로 취급
  if (!targetLocation) {
    return {isWithin100m: false, distance: undefined};
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

    return {
      isWithin100m: distance <= 100,
      distance,
    };
  } catch (error) {
    // 현재 위치를 가져올 수 없으면 거리가 먼 것으로 취급 (사용자 요구사항)
    return {isWithin100m: false, distance: undefined};
  }
}
