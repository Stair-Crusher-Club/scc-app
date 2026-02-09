import {QueryKey, useMutation, useQueryClient} from '@tanstack/react-query';
import {useAtomValue} from 'jotai';

import {PlaceListItem} from '@/generated-sources/openapi';
import {
  filterAtom,
  searchModeAtom,
  searchQueryAtom,
} from '@/screens/SearchScreen/atoms';
import ToastUtils from '@/utils/ToastUtils';

import useAppComponents from './useAppComponents';

export function useToggleAccessibilityInfoRequest() {
  const {api} = useAppComponents();
  const queryClient = useQueryClient();

  const {text, location, useCameraRegion} = useAtomValue(searchQueryAtom);
  const {sortOption, scoreUnder, hasSlope, isRegistered} =
    useAtomValue(filterAtom);
  const searchMode = useAtomValue(searchModeAtom);

  const {mutate, isPending} = useMutation({
    mutationFn: async ({
      currentIsRequested,
      placeId,
    }: {
      currentIsRequested?: boolean;
      placeId: string;
      searchQueryKey?: QueryKey;
    }) => {
      if (currentIsRequested) {
        return await api.deletePlaceAccessibilityInfoRequestPost({placeId});
      } else {
        return await api.createPlaceAccessibilityInfoRequestPost({placeId});
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
                  isAccessibilityInfoRequested: !variables.currentIsRequested,
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
      if (!variables.currentIsRequested) {
        ToastUtils.show('정보가 등록되면 알림을 보내드릴게요 🔔');
      } else {
        ToastUtils.show('정보 요청이 취소되었어요');
      }

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

  const safeMutate = (args: {
    currentIsRequested?: boolean;
    placeId: string;
  }) => {
    if (isPending) return;
    mutate({
      ...args,
      searchQueryKey: [
        'search',
        {
          text,
          location,
          sortOption,
          scoreUnder,
          hasSlope,
          isRegistered,
          useCameraRegion,
          searchMode,
        },
      ],
    });
  };

  return safeMutate;
}
