import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useAtomValue} from 'jotai';

import {PlaceListItem} from '@/generated-sources/openapi';
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
    onMutate: async variables => {
      await queryClient.cancelQueries({
        queryKey: [
          'search',
          {text, location, sortOption, scoreUnder, hasSlope, isRegistered},
        ],
      });

      const previousSearchData = queryClient.getQueryData<PlaceListItem[]>([
        'search',
        {text, location, sortOption, scoreUnder, hasSlope, isRegistered},
      ]);

      queryClient.setQueryData<PlaceListItem[]>(
        [
          'search',
          {text, location, sortOption, scoreUnder, hasSlope, isRegistered},
        ],
        oldData => {
          if (!oldData) return oldData;

          return oldData.map(data =>
            data.place.id === variables.placeId
              ? {
                  ...data,
                  place: {
                    ...data.place,
                    isFavorite: !variables.currentIsFavorite,
                  },
                }
              : data,
          );
        },
      );

      return {
        previousSearchData,
      };
    },
    onSuccess: (_data, variables) => {
      if (!variables.currentIsFavorite) {
        ToastUtils.show('[메뉴 → 저장한 장소]에서 확인 가능해요');
      }

      queryClient.invalidateQueries({queryKey: ['FavoritePlaces']});

      queryClient.invalidateQueries({
        queryKey: ['PlaceDetail', variables.placeId],
      });
    },
    onError: (error, _variables, context) => {
      ToastUtils.showOnApiError(error);

      if (context?.previousSearchData) {
        queryClient.setQueryData(
          [
            'search',
            {text, location, sortOption, scoreUnder, hasSlope, isRegistered},
          ],
          context.previousSearchData,
        );
      }
    },
  });

  const safeMutate = (args: {currentIsFavorite?: boolean; placeId: string}) => {
    if (isPending) return;
    mutate(args);
  };

  return safeMutate;
}
