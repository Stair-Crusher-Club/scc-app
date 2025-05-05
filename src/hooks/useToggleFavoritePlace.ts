import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useAtom, useAtomValue} from 'jotai';

import {loadingState} from '@/components/LoadingView';
import {filterAtom, searchQueryAtom} from '@/screens/SearchScreen/atoms';
import ToastUtils from '@/utils/ToastUtils';

import useAppComponents from './useAppComponents';

export function useToggleFavoritePlace() {
  const {api} = useAppComponents();
  const [loading, setLoading] = useAtom(loadingState);
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
    onMutate: () => setLoading(new Map(loading).set('FavoritePlace', true)),
    onSuccess: (_data, variables) => {
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
    onError: error => {
      ToastUtils.showOnApiError(error);
    },
    onSettled: () => {
      setLoading(new Map(loading).set('FavoritePlace', false));
    },
  });
}
