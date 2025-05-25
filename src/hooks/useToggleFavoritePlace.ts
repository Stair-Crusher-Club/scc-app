import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useAtomValue} from 'jotai';

import {filterAtom, searchQueryAtom} from '@/screens/SearchScreen/atoms';
import ToastUtils from '@/utils/ToastUtils';

import useAppComponents from './useAppComponents';

export function useToggleFavoritePlace() {
  const {api} = useAppComponents();
  const queryClient = useQueryClient();

  const {text, location} = useAtomValue(searchQueryAtom);
  const {sortOption, scoreUnder, hasSlope, isRegistered} =
    useAtomValue(filterAtom);

  const {mutate, isPending} = useMutation({
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
    onSuccess: (_data, variables) => {
      if (!variables.currentIsFavorite) {
        ToastUtils.show('[메뉴 → 저장한 장소]에서 확인 가능해요');
      }

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
  });

  const safeMutate = (args: {currentIsFavorite?: boolean; placeId: string}) => {
    if (isPending) return;
    mutate(args);
  };

  return safeMutate;
}
