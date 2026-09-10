import {MarkerItem} from '@/components/maps/MarkerItem.ts';
import {distanceInMeter} from '@/utils/DistanceUtils.ts';

export type LatLng = {
  latitude: number;
  longitude: number;
};

export type Region = {
  northEast: LatLng;
  southWest: LatLng;
};

export type CameraIdleEvent = {
  region: Region;
  zoom: number;
  center: LatLng;
  reason: number; // 0=gesture, 1=control, 2=location, 3=developer
};

export function getCenterAndRadius(region: Region) {
  const center = {
    latitude: (region.northEast.latitude + region.southWest.latitude) / 2,
    longitude: (region.northEast.longitude + region.southWest.longitude) / 2,
  };
  // 대각선 거리를 반지름으로 사용하여 모든 corners가 포함되도록 함
  const radius = distanceInMeter(
    {
      latitude: region.southWest.latitude,
      longitude: region.southWest.longitude,
    },
    center,
  );
  return {center, radius};
}

export function getRegionFromItems(items: MarkerItem[]) {
  const latitudes = items
    .map(it => it.location?.lat)
    .filter(Boolean) as number[];
  const longitudes = items
    .map(it => it.location?.lng)
    .filter(Boolean) as number[];
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);

  const northEast = {latitude: maxLatitude, longitude: maxLongitude};
  const southWest = {latitude: minLatitude, longitude: minLongitude};

  const latDiff = northEast.latitude - southWest.latitude;
  const lngDiff = northEast.longitude - southWest.longitude;

  const minLatDiff = 0.0018; // Approx. 200m in degrees latitude
  const minLngDiff = 0.0018; // Approx. 200m in degrees longitude

  if (latDiff < minLatDiff) {
    const centerLat = (northEast.latitude + southWest.latitude) / 2;
    northEast.latitude = centerLat + minLatDiff / 2;
    southWest.latitude = centerLat - minLatDiff / 2;
  }

  if (lngDiff < minLngDiff) {
    const centerLng = (northEast.longitude + southWest.longitude) / 2;
    northEast.longitude = centerLng + minLngDiff / 2;
    southWest.longitude = centerLng - minLngDiff / 2;
  }

  return {
    northEast,
    southWest,
  };
}

/** 장소가 카메라 region 밖에 있는지 (location 없는 장소는 판단 불가라 false 취급). */
export function isItemOutsideRegion(
  item: {location?: {lat: number; lng: number}},
  region: Region,
): boolean {
  const location = item.location;
  if (!location) {
    return false;
  }
  return (
    location.lat > region.northEast.latitude ||
    location.lat < region.southWest.latitude ||
    location.lng > region.northEast.longitude ||
    location.lng < region.southWest.longitude
  );
}

/**
 * 최초 로드(cameraRegion 없음)거나, 필터 변경으로 바뀐 items 중 현재 카메라 밖에
 * 있는 장소가 하나라도 있으면 다시 fit 해야 한다. 필터 결과가 이미 화면 안에 다
 * 들어와 있으면(예: 부분집합) 카메라를 그대로 둬 불필요한 점프를 막는다.
 */
export function shouldRefitCamera(
  items: {location?: {lat: number; lng: number}}[],
  cameraRegion: Region | null,
): boolean {
  if (items.length === 0) {
    return false;
  }
  if (!cameraRegion) {
    return true;
  }
  return items.some(item => isItemOutsideRegion(item, cameraRegion));
}

export function getRegionCorners(region: Region): LatLng[] {
  return [
    // 북동쪽 (우상단)
    {
      latitude: region.northEast.latitude,
      longitude: region.northEast.longitude,
    },
    // 북서쪽 (좌상단)
    {
      latitude: region.northEast.latitude,
      longitude: region.southWest.longitude,
    },
    // 남서쪽 (좌하단)
    {
      latitude: region.southWest.latitude,
      longitude: region.southWest.longitude,
    },
    // 남동쪽 (우하단)
    {
      latitude: region.southWest.latitude,
      longitude: region.northEast.longitude,
    },
  ];
}
