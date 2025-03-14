export function distanceInMeter(
  p1: {latitude: number; longitude: number},
  p2: {latitude: number; longitude: number},
) {
  const lat1 = p1.latitude;
  const lon1 = p1.longitude;
  const lat2 = p2.latitude;
  const lon2 = p2.longitude;
  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  } else {
    var radlat1 = (Math.PI * lat1) / 180;
    var radlat2 = (Math.PI * lat2) / 180;
    var theta = lon1 - lon2;
    var radtheta = (Math.PI * theta) / 180;
    var dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    dist = dist * 1.609344 * 1000; // Meter Conversion
    return dist;
  }
}

export function prettyFormatMeter(meter?: number) {
  if (meter === undefined) {
    return '- m';
  } else if (meter < 1000) {
    return `${Math.round(meter)} m`;
  } else {
    return `${(meter / 1000).toFixed(1)} km`;
  }
}
