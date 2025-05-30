import {QueryKey, useMutation, useQueryClient} from '@tanstack/react-query';
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
      searchQueryKey?: QueryKey;
    }) => {
      if (currentIsFavorite) {
        return await api.deletePlaceFavoritePost({placeId});
      } else {
        return await api.createPlaceFavoritePost({placeId});
      }
    },
    onMutate: async variables => {
      if (variables.searchQueryKey === undefined) {
        return;
      }

      await queryClient.cancelQueries({
        queryKey: variables.searchQueryKey,
      });

      const previousSearchData = queryClient.getQueryData<PlaceListItem[]>(
        variables.searchQueryKey,
      );

      queryClient.setQueryData<PlaceListItem[]>(
        variables.searchQueryKey,
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
    onError: (error, variables, context) => {
      ToastUtils.showOnApiError(error);

      if (
        context?.previousSearchData &&
        variables.searchQueryKey !== undefined
      ) {
        queryClient.setQueryData(
          variables.searchQueryKey,
          context.previousSearchData,
        );
      }
    },
  });

  const safeMutate = (args: {currentIsFavorite?: boolean; placeId: string}) => {
    if (isPending) return;
    mutate({
      ...args,
      searchQueryKey: [
        'search',
        {text, location, sortOption, scoreUnder, hasSlope, isRegistered},
      ],
    });
  };

  return safeMutate;
}
