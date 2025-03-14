export type MarkerItem = {
  id: string;
  markerIcon?: {icon: MarkerIcon; level: MarkerLevel};
  displayName: string;
  location?: {lat: number; lng: number};
};

export function toStringMarkerIcon(
  markerIcon: {icon: MarkerIcon; level: MarkerLevel} | undefined,
): string | undefined {
  if (!markerIcon) {
    return undefined;
  }
  return markerIcon.icon + '_' + markerIcon.level;
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
