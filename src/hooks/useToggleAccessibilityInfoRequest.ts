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

export function useToggleAccessibilityInfoRequest(listQueryKey?: QueryKey) {
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

      const previousSearchData = queryClient.getQueryData(
        variables.searchQueryKey,
      );

      queryClient.setQueryData(variables.searchQueryKey, (oldData: unknown) => {
        if (!oldData) return oldData;

        const toggleItem = (item: PlaceListItem) =>
          item.place.id === variables.placeId
            ? {
                ...item,
                isAccessibilityInfoRequested: !variables.currentIsRequested,
              }
            : item;

        // search 쿼리: PlaceListItem[]
        if (Array.isArray(oldData)) {
          return (oldData as PlaceListItem[]).map(toggleItem);
        }

        // PlaceListDetail 쿼리: { placeList, places: PlaceListItem[] }
        const wrapper = oldData as {places?: PlaceListItem[]};
        if (wrapper.places) {
          return {...wrapper, places: wrapper.places.map(toggleItem)};
        }

        return oldData;
      });

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
      queryClient.invalidateQueries({
        queryKey: ['PlaceDetailV2', variables.placeId],
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
      searchQueryKey: listQueryKey ?? [
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
