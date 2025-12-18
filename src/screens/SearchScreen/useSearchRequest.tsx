import {useKeyboard} from '@react-native-community/hooks';
import {useRoute} from '@react-navigation/native';
import {useQuery} from '@tanstack/react-query';
import {useAtomValue} from 'jotai';
import {useEffect, useRef} from 'react';

import {useDevTool} from '@/components/DevTool/useDevTool';
import {getCenterAndRadius} from '@/components/maps/Types.tsx';
import {
  PlaceListItem,
  RectangleSearchRegionDto,
  SearchPlaceSortDto,
} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import Logger from '@/logging/Logger';
import {
  SortOption,
  draftCameraRegionAtom,
  filterAtom,
  searchQueryAtom,
  viewStateAtom,
} from '@/screens/SearchScreen/atoms';
import {useUpdateSearchQuery} from '@/screens/SearchScreen/useUpdateSearchQuery.tsx';
import GeolocationUtils from '@/utils/GeolocationUtils';
import ToastUtils from '@/utils/ToastUtils.ts';

export default function useSearchRequest() {
  const {api} = useAppComponents();
  const {sortOption, scoreUnder, hasSlope, isRegistered} =
    useAtomValue(filterAtom);
  const {text, location, radiusMeter, useCameraRegion} =
    useAtomValue(searchQueryAtom);
  const draftCameraRegion = useAtomValue(draftCameraRegionAtom);
  const viewState = useAtomValue(viewStateAtom);
  const route = useRoute();
  const devTool = useDevTool();
  const keyboard = useKeyboard();
  const keyboardRef = useRef(keyboard);
  const {data, isFetching, refetch} = useQuery({
    initialData: [],
    throwOnError: error => {
      ToastUtils.showOnApiError(error);
      return false;
    },
    queryKey: [
      'search',
      {
        text,
        location,
        sortOption,
        scoreUnder,
        hasSlope,
        isRegistered,
        useCameraRegion,
      },
    ],
    queryFn: async ({signal}) => {
      if (!text) {
        return null; // No search text -> Do not call API because it is landing page
      }
      let sort;
      let currentLocation;
      if (sortOption === SortOption.DISTANCE) {
        sort = SearchPlaceSortDto.Distance;
      } else {
        sort = SearchPlaceSortDto.Accuracy;
      }
      if (location === null) {
        const currentPosition = await GeolocationUtils.getCurrentPosition();
        currentLocation = {
          lat: currentPosition.coords.latitude,
          lng: currentPosition.coords.longitude,
        };
      }

      // Track the search request in DevTool
      let searchLocation = location ?? currentLocation;
      let searchRadius = radiusMeter ?? 20000;
      let rectangleRegion: RectangleSearchRegionDto | undefined;

      // If we have draft camera region, use rectangle search instead of circle
      // Also use rectangle search when useCameraRegion is true (재검색 버튼)
      if (draftCameraRegion && (!radiusMeter || useCameraRegion)) {
        rectangleRegion = {
          leftTopLocation: {
            lat: draftCameraRegion.northEast.latitude,
            lng: draftCameraRegion.southWest.longitude,
          },
          rightBottomLocation: {
            lat: draftCameraRegion.southWest.latitude,
            lng: draftCameraRegion.northEast.longitude,
          },
        };

        // For DevTool tracking, use rectangle tracking
        devTool.searchRegion.trackRectangle(
          rectangleRegion.leftTopLocation,
          rectangleRegion.rightBottomLocation,
        );

        // For fallback compatibility, also calculate center and radius
        const {center, radius} = getCenterAndRadius(draftCameraRegion);
        searchRadius = Math.round(radius);
        searchLocation = {
          lat: center.latitude,
          lng: center.longitude,
        };
      } else if (searchLocation) {
        // Use circle tracking for non-rectangle searches
        devTool.searchRegion.trackCircle(searchLocation, searchRadius);
      }

      const response = await api.searchPlacesPost(
        {
          searchText: text,
          distanceMetersLimit: rectangleRegion
            ? undefined
            : (radiusMeter ?? 20000),
          currentLocation: rectangleRegion
            ? undefined
            : (location ?? currentLocation),
          rectangleRegion: rectangleRegion,
          sort: sort,
          filters: {
            maxAccessibilityScore: scoreUnder ?? undefined,
            hasSlope: hasSlope ?? undefined,
            isRegistered: isRegistered ?? undefined,
          },
        },
        {signal},
      );
      Logger.logElementClick({
        name: 'place_search',
        currScreenName: route.name,
        extraParams: {
          search_query: text,
        },
      });
      const result = response?.data.items || [];
      if (result.length === 0) {
        ToastUtils.show('검색 결과가 없습니다.');
      }
      onFetchCompleted.current?.(result);
      onFetchCompleted.current = () => {};
      return result;
    },
  });
  const onFetchCompleted = useRef<(result: PlaceListItem[]) => void>(() => {});
  const pendingCallbackRef = useRef<(() => void) | null>(null);
  const {updateQuery} = useUpdateSearchQuery();
  const setOnFetchCompleted: (
    callback: (result: PlaceListItem[]) => void,
  ) => void = callback => {
    onFetchCompleted.current = (result: PlaceListItem[]) => {
      if (keyboardRef.current.keyboardShown) {
        // 키보드가 올라와 있으면 실행 연기
        pendingCallbackRef.current = () => callback(result);
      } else {
        // 키보드가 내려가 있으면 즉시 실행
        setTimeout(() => callback(result), 100); // 지도 하단의 카드 리스트가 그려지는 것을 기다리기 위해 100ms 기다렸다가 렌더링한다. (100ms는 heuristic)
      }
    };
  };

  // keyboard 상태가 변경될 때마다 ref 업데이트
  useEffect(() => {
    keyboardRef.current = keyboard;
  }, [keyboard]);

  useEffect(() => {
    // autocomplete로 인해 input 모드에서 검색이 검색이
    // input 모드에서 지도 뷰로 전환할 때도 카메라 피팅을 해준다.
    // 단, 데이터가 fetching 중일 때는 fetching 이후 카메라 피팅을 해야 하므로 그냥 넘어간다.
    if (!viewState.inputMode && viewState.type === 'map' && !isFetching) {
      setTimeout(() => {
        onFetchCompleted.current?.(data ?? []);
        onFetchCompleted.current = () => {};
      });
    }
  }, [viewState.inputMode, viewState.type]);

  // 키보드가 내려가면 pending callback 실행
  useEffect(() => {
    if (!keyboard.keyboardShown && pendingCallbackRef.current) {
      const pendingCallback = pendingCallbackRef.current;
      setTimeout(pendingCallback, 100); // 지도 하단의 카드 리스트가 그려지는 것을 기다리기 위해 100ms 기다렸다가 렌더링한다. (100ms는 heuristic)
      pendingCallbackRef.current = null;
    }
  }, [keyboard.keyboardShown]);

  return {
    data,
    isLoading: isFetching,
    refetch,
    updateQuery,
    setOnFetchCompleted,
  };
}
