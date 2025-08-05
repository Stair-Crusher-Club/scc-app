import {MarkerIcon, MarkerLevel} from '@/components/maps/MarkerItem';
import MarkerCafeOnRaw from '@/assets/icon/ic_marker_cafe_on.svg.txt';
import MarkerConvOnRaw from '@/assets/icon/ic_marker_conv_on.svg.txt';
import MarkerPharOnRaw from '@/assets/icon/ic_marker_phar_on.svg.txt';
import MarkerRestOnRaw from '@/assets/icon/ic_marker_rest_on.svg.txt';
import MarkerHosOnRaw from '@/assets/icon/ic_marker_hos_on.svg.txt';
import MarkerDefaultOnRaw from '@/assets/icon/ic_marker_default_on.svg.txt';
import MarkerCafeOffRaw from '@/assets/icon/ic_marker_cafe_off.svg.txt';
import MarkerConvOffRaw from '@/assets/icon/ic_marker_conv_off.svg.txt';
import MarkerPharOffRaw from '@/assets/icon/ic_marker_phar_off.svg.txt';
import MarkerRestOffRaw from '@/assets/icon/ic_marker_rest_off.svg.txt';
import MarkerHosOffRaw from '@/assets/icon/ic_marker_hos_off.svg.txt';
import MarkerDefaultOffRaw from '@/assets/icon/ic_marker_default_off.svg.txt';
import MarkerCafeReviewOnRaw from '@/assets/icon/ic_marker_cafe_review_on.svg.txt';
import MarkerConvReviewOnRaw from '@/assets/icon/ic_marker_conv_review_on.svg.txt';
import MarkerPharReviewOnRaw from '@/assets/icon/ic_marker_phar_review_on.svg.txt';
import MarkerRestReviewOnRaw from '@/assets/icon/ic_marker_rest_review_on.svg.txt';
import MarkerHosReviewOnRaw from '@/assets/icon/ic_marker_hos_review_on.svg.txt';
import MarkerDefaultReviewOnRaw from '@/assets/icon/ic_marker_default_review_on.svg.txt';
import MarkerCafeReviewOffRaw from '@/assets/icon/ic_marker_cafe_review_off.svg.txt';
import MarkerConvReviewOffRaw from '@/assets/icon/ic_marker_conv_review_off.svg.txt';
import MarkerPharReviewOffRaw from '@/assets/icon/ic_marker_phar_review_off.svg.txt';
import MarkerRestReviewOffRaw from '@/assets/icon/ic_marker_rest_review_off.svg.txt';
import MarkerHosReviewOffRaw from '@/assets/icon/ic_marker_hos_review_off.svg.txt';
import MarkerDefaultReviewOffRaw from '@/assets/icon/ic_marker_default_review_off.svg.txt';

export function getMarkerSvg(
  icon: MarkerIcon,
  isFocused: boolean,
  hasReview: boolean,
) {
  if (isFocused) {
    if (hasReview) {
      switch (icon) {
        case 'cafe':
          return MarkerCafeReviewOnRaw;
        case 'conv':
          return MarkerConvReviewOnRaw;
        case 'phar':
          return MarkerPharReviewOnRaw;
        case 'rest':
          return MarkerRestReviewOnRaw;
        case 'hos':
          return MarkerHosReviewOnRaw;
        case 'default':
          return MarkerDefaultReviewOnRaw;
        case 'toilet':
          return MarkerDefaultReviewOnRaw;
      }
    } else {
      switch (icon) {
        case 'cafe':
          return MarkerCafeOnRaw;
        case 'conv':
          return MarkerConvOnRaw;
        case 'phar':
          return MarkerPharOnRaw;
        case 'rest':
          return MarkerRestOnRaw;
        case 'hos':
          return MarkerHosOnRaw;
        case 'default':
          return MarkerDefaultOnRaw;
        case 'toilet':
          return MarkerDefaultOnRaw;
      }
    }
  } else {
    if (hasReview) {
      switch (icon) {
        case 'cafe':
          return MarkerCafeReviewOffRaw;
        case 'conv':
          return MarkerConvReviewOffRaw;
        case 'phar':
          return MarkerPharReviewOffRaw;
        case 'rest':
          return MarkerRestReviewOffRaw;
        case 'hos':
          return MarkerHosReviewOffRaw;
        case 'default':
          return MarkerDefaultReviewOffRaw;
        case 'toilet':
          return MarkerDefaultReviewOffRaw;
      }
    } else {
      switch (icon) {
        case 'cafe':
          return MarkerCafeOffRaw;
        case 'conv':
          return MarkerConvOffRaw;
        case 'phar':
          return MarkerPharOffRaw;
        case 'rest':
          return MarkerRestOffRaw;
        case 'hos':
          return MarkerHosOffRaw;
        case 'default':
          return MarkerDefaultOffRaw;
        case 'toilet':
          return MarkerDefaultOffRaw;
      }
    }
  }
}

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
