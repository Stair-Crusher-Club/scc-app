import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useAtom, useAtomValue} from 'jotai';

import {loadingState} from '@/components/LoadingView';
import {AccessibilityInfoDto} from '@/generated-sources/openapi';
import useNavigation from '@/navigation/useNavigation';
import {filterAtom, searchQueryAtom} from '@/screens/SearchScreen/atoms';
import ToastUtils from '@/utils/ToastUtils';

export function useDeleteAccessibility(
  mutationFn: (params: {
    type: 'place' | 'building';
    accessibilityDto: AccessibilityInfoDto;
  }) => Promise<void>,
) {
  const [loading, setLoading] = useAtom(loadingState);
  const queryClient = useQueryClient();
  const navigation = useNavigation();

  const {text, location} = useAtomValue(searchQueryAtom);
  const {sortOption, scoreUnder, hasSlope, isRegistered} =
    useAtomValue(filterAtom);

  return useMutation({
    mutationFn: mutationFn,
    onMutate: () => setLoading(new Map(loading).set('PlaceDetail', true)),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          'PlaceDetail',
          variables.accessibilityDto.placeAccessibility?.placeId,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          'search',
          {text, location, sortOption, scoreUnder, hasSlope, isRegistered},
        ],
      });

      navigation.goBack();
    },
    onError: (_error, variables) => {
      if (variables.type === 'place') {
        ToastUtils.show('삭제할 수 없는 장소입니다.');
      } else {
        ToastUtils.show('삭제할 수 없는 건물입니다.');
      }
    },
    onSettled: () => {
      setLoading(new Map(loading).set('PlaceDetail', false));
    },
  });
}
