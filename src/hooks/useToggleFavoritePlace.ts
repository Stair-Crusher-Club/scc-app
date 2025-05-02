import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useAtomValue} from 'jotai';

import {filterAtom, searchQueryAtom} from '@/screens/SearchScreen/atoms';

import useAppComponents from './useAppComponents';

export function useToggleFavoritePlace() {
  const {api} = useAppComponents();
  const queryClient = useQueryClient();
  const {text, location} = useAtomValue(searchQueryAtom);
  const {sortOption, scoreUnder, hasSlope, isRegistered} =
    useAtomValue(filterAtom);

  return useMutation({
    mutationFn: async ({
      currentIsFavorite,
      placeId,
    }: {
      currentIsFavorite?: boolean;
      placeId: string;
    }) => {
      if (currentIsFavorite) {
        return await api.deletePlaceFavoritePost({placeId});
      } else {
        return await api.createPlaceFavoritePost({placeId});
      }
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({queryKey: ['FavoritePlaces']});

      queryClient.invalidateQueries({
        queryKey: ['PlaceDetail', variables.placeId],
      });

      queryClient.invalidateQueries({
        queryKey: [
          'search',
          {text, location, sortOption, scoreUnder, hasSlope, isRegistered},
        ],
      });
    },
  });
}
