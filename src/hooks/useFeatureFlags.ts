import {featureFlagAtom} from '@/atoms/Auth';
import {useAtomValue} from 'jotai';

/**
 * PlaceList 기능 활성화 여부를 확인합니다.
 * PLACE_LIST_ENABLED 플래그 활성화: SavedPlaceLists 화면 사용
 * 일반 모드: FavoritePlaces 화면 사용
 */
export const useIsPlaceListEnabled = (): boolean => {
  const featureFlag = useAtomValue(featureFlagAtom);
  return featureFlag?.isPlaceListEnabled ?? false;
};
