import {useRoute} from '@react-navigation/native';
import {useQuery} from '@tanstack/react-query';
import {useAtomValue} from 'jotai';
import {useRef} from 'react';

import {PlaceListItem, SearchPlaceSortDto} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import Logger from '@/logging/Logger';
import {
  SortOption,
  filterAtom,
  searchQueryAtom,
} from '@/screens/SearchScreen/atoms';
import {useUpdateSearchQuery} from '@/screens/SearchScreen/useUpdateSearchQuery.tsx';
import GeolocationUtils from '@/utils/GeolocationUtils';
import ToastUtils from '@/utils/ToastUtils.ts';

export default function useSearchRequest() {
  const {api} = useAppComponents();
  const {sortOption, scoreUnder, hasSlope, isRegistered} =
    useAtomValue(filterAtom);
  const {text, location, radiusMeter} = useAtomValue(searchQueryAtom);
  const route = useRoute();
  const {data, isFetching, refetch} = useQuery({
    initialData: [],
    queryKey: [
      'search',
      {text, location, sortOption, scoreUnder, hasSlope, isRegistered},
    ],
    queryFn: async ({}) => {
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
      const response = await api.searchPlacesPost({
        searchText: text,
        distanceMetersLimit: radiusMeter ?? 20000,
        currentLocation: location ?? currentLocation,
        sort: sort,
        filters: {
          maxAccessibilityScore: scoreUnder ?? undefined,
          hasSlope: hasSlope ?? undefined,
          isRegistered: isRegistered ?? undefined,
        },
      });
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
      return result;
    },
    queryKeyHashFn: queryKey => JSON.stringify(queryKey),
  });
  const onFetchCompleted = useRef<(result: PlaceListItem[]) => void>();
  const {updateQuery} = useUpdateSearchQuery();
  const setOnFetchCompleted: (
    callback: (result: PlaceListItem[]) => void,
  ) => void = callback => {
    onFetchCompleted.current = callback;
  };
  return {
    data,
    isLoading: isFetching,
    refetch,
    updateQuery,
    setOnFetchCompleted,
  };
}
