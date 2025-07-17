import {MarkerIcon, MarkerLevel} from '@/components/maps/MarkerItem';
import MarkerCafeOnRaw from '@/assets/icon/ic_marker_cafe_on.svg.txt';
import MarkerConvOnRaw from '@/assets/icon/ic_marker_conv_on.svg.txt';
import MarkerPharOnRaw from '@/assets/icon/ic_marker_phar_on.svg.txt';
import MarkerRestOnRaw from '@/assets/icon/ic_marker_rest_on.svg.txt';
import MarkerHosOnRaw from '@/assets/icon/ic_marker_hos_on.svg.txt';
import MarkerDefaultOnRaw from '@/assets/icon/ic_marker_default_on.svg.txt';
import MarkerToiletOnRaw from '@/assets/icon/ic_marker_toilet_on.svg.txt';
import MarkerCafeOffRaw from '@/assets/icon/ic_marker_cafe_off.svg.txt';
import MarkerConvOffRaw from '@/assets/icon/ic_marker_conv_off.svg.txt';
import MarkerPharOffRaw from '@/assets/icon/ic_marker_phar_off.svg.txt';
import MarkerRestOffRaw from '@/assets/icon/ic_marker_rest_off.svg.txt';
import MarkerHosOffRaw from '@/assets/icon/ic_marker_hos_off.svg.txt';
import MarkerDefaultOffRaw from '@/assets/icon/ic_marker_default_off.svg.txt';
import MarkerToiletOffRaw from '@/assets/icon/ic_marker_toilet_off.svg.txt';

export const MarkerOn: Record<MarkerIcon, string> = {
  cafe: MarkerCafeOnRaw,
  conv: MarkerConvOnRaw,
  phar: MarkerPharOnRaw,
  rest: MarkerRestOnRaw,
  hos: MarkerHosOnRaw,
  default: MarkerDefaultOnRaw,
  toilet: MarkerToiletOnRaw,
} as const;

export const MarkerOff: Record<MarkerIcon, string> = {
  cafe: MarkerCafeOffRaw,
  conv: MarkerConvOffRaw,
  phar: MarkerPharOffRaw,
  rest: MarkerRestOffRaw,
  hos: MarkerHosOffRaw,
  default: MarkerDefaultOffRaw,
  toilet: MarkerToiletOffRaw,
} as const;

export const MarkerColors: Record<MarkerLevel, string> = {
  '0': '#06903A',
  '1': '#85CF3A',
  '2': '#FFC109',
  '3': '#FF9202',
  '4': '#FF5722',
  '5': '#E52123',
  none: '#9A9B9F',
  progress: '#FFC109',
};
