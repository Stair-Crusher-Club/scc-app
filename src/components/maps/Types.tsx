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

export function getCenterAndRadius(region: Region) {
  const center = {
    latitude: (region.northEast.latitude + region.southWest.latitude) / 2,
    longitude: (region.northEast.longitude + region.southWest.longitude) / 2,
  };
  const radius = Math.min(
    distanceInMeter(
      {
        longitude: center.longitude,
        latitude: region.southWest.latitude,
      },
      center,
    ),
    distanceInMeter(
      {
        latitude: center.latitude,
        longitude: region.southWest.longitude,
      },
      center,
    ),
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
