import {useMutation, useQueryClient} from '@tanstack/react-query';

import {
  GetSccContentDetailsResponseDto,
  SccContentTypeDto,
} from '@/generated-sources/openapi';
import ToastUtils from '@/utils/ToastUtils';

import useAppComponents from './useAppComponents';

interface UseSaveContentOptions {
  /**
   * mutation 성공 시 호출되는 부가 콜백. isSaved = 호출 직후 저장 상태.
   */
  onSuccess?: (variables: {isSaved: boolean; url: string}) => void;
}

interface SaveContentMutateArgs {
  url: string;
  contentType: SccContentTypeDto;
  title?: string | null;
  thumbnailUrl?: string | null;
  description?: string | null;
  currentIsSaved: boolean;
  currentSccContentId?: string | null;
}

/**
 * SccContentDetails 캐시의 isSaved/sccContentId만 즉시 toggle하기 위한 query key prefix.
 * 서버 응답 + invalidate refetch 사이의 지연을 가리기 위함.
 */
const SCC_CONTENT_DETAILS_QUERY_KEY_PREFIX = 'SccContentDetails';

export function useSaveContent(options?: UseSaveContentOptions) {
  const {api} = useAppComponents();
  const queryClient = useQueryClient();

  const {mutate, isPending} = useMutation({
    mutationFn: async ({
      url,
      contentType,
      title,
      thumbnailUrl,
      description,
      currentIsSaved,
      currentSccContentId,
    }: SaveContentMutateArgs) => {
      if (currentIsSaved && currentSccContentId) {
        await api.unsaveContentPost({sccContentId: currentSccContentId});
        return {isSaved: false, sccContentId: currentSccContentId};
      } else {
        const {data} = await api.saveContentPost({
          url,
          contentType,
          ...(title != null ? {title} : {}),
          ...(thumbnailUrl != null ? {thumbnailUrl} : {}),
          ...(description != null ? {description} : {}),
        });
        return {isSaved: true, sccContentId: data.sccContentId};
      }
    },
    onMutate: async ({url, currentIsSaved, currentSccContentId}) => {
      await queryClient.cancelQueries({
        queryKey: [SCC_CONTENT_DETAILS_QUERY_KEY_PREFIX, url],
      });

      const prev = queryClient.getQueryData<GetSccContentDetailsResponseDto>([
        SCC_CONTENT_DETAILS_QUERY_KEY_PREFIX,
        url,
      ]);

      queryClient.setQueryData<GetSccContentDetailsResponseDto>(
        [SCC_CONTENT_DETAILS_QUERY_KEY_PREFIX, url],
        old => {
          if (!old) {
            return {
              ...(currentSccContentId
                ? {sccContentId: currentSccContentId}
                : {}),
              isSaved: !currentIsSaved,
              isUpvoted: false,
              totalUpvoteCount: 0,
            };
          }
          return {
            ...old,
            isSaved: !currentIsSaved,
          };
        },
      );

      return {prev};
    },
    onSuccess: ({isSaved, sccContentId}, variables) => {
      // 새로 저장된 경우 캐시에 sccContentId도 반영
      queryClient.setQueryData<GetSccContentDetailsResponseDto>(
        [SCC_CONTENT_DETAILS_QUERY_KEY_PREFIX, variables.url],
        old => {
          if (!old) {
            return {
              sccContentId,
              isSaved,
              isUpvoted: false,
              totalUpvoteCount: 0,
            };
          }
          return {
            ...old,
            sccContentId,
            isSaved,
          };
        },
      );

      queryClient.invalidateQueries({
        queryKey: [SCC_CONTENT_DETAILS_QUERY_KEY_PREFIX, variables.url],
      });
      queryClient.invalidateQueries({queryKey: ['SavedContents']});

      if (isSaved) {
        ToastUtils.show('[메뉴 > 저장한 장소]에 저장했습니다.');
      } else {
        ToastUtils.show('저장을 해제했습니다.');
      }

      options?.onSuccess?.({isSaved, url: variables.url});
    },
    onError: (error, variables, context) => {
      if (context?.prev !== undefined) {
        queryClient.setQueryData(
          [SCC_CONTENT_DETAILS_QUERY_KEY_PREFIX, variables.url],
          context.prev,
        );
      }
      ToastUtils.showOnApiError(error);
    },
  });

  const safeMutate = (args: SaveContentMutateArgs) => {
    if (isPending) return;
    mutate(args);
  };

  return safeMutate;
}
