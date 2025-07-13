export type MarkerItem = {
  id: string;
  markerIcon?: {icon: MarkerIcon; level: MarkerLevel};
  displayName: string;
  location?: {lat: number; lng: number};
};

export function toStringMarkerIcon(
  markerIcon: {icon: MarkerIcon; level: MarkerLevel} | undefined,
): {icon: string; color: string; width: number; height: number} | undefined {
  if (!markerIcon) {
    return undefined;
  }
  return {
    icon: markerIcon.icon + '_' + markerIcon.level,
    color: 'black',
    width: 10,
    height: 10,
  };
}

export type MarkerIcon =
  | 'cafe'
  | 'conv'
  | 'phar'
  | 'rest'
  | 'hos'
  | 'default'
  | 'toilet';

export type MarkerLevel =
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | 'none'
  | 'progress';
