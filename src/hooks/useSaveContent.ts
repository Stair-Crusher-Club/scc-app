import {useMutation, useQueryClient} from '@tanstack/react-query';

import {SccContentTypeDto} from '@/generated-sources/openapi';
import type {GetSccContentDetailsResponseDto} from '@/generated-sources/openapi';
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
  /**
   * 페이지에서 추출한 이미지 URL 목록 (og:image + 본문 <img>). 빈 배열이라도 항상 전달한다
   * (SccContentWebPageDetailDto.imageUrls 가 required).
   */
  imageUrls: string[];
  description?: string | null;
  currentIsSaved: boolean;
  currentSccContentId?: string | null;
  /**
   * SccContentDetails 캐시 query key 의 추가 segment.
   * 호출처(SccContentFloatingBar)가 ['SccContentDetails', url, bbucleRoadId] 로 cache 하므로
   * 낙관적 setQueryData 가 exact match 되도록 동일 segment 를 전달한다.
   */
  upvoteTargetId?: string | null;
}

/**
 * SccContentDetails 캐시의 isSaved/sccContentId만 즉시 toggle하기 위한 query key prefix.
 * 실제 cache key 는 [PREFIX, url, upvoteTargetId ?? null] 형태로 호출처와 일치시킨다.
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
      imageUrls,
      description,
      currentIsSaved,
      currentSccContentId,
    }: SaveContentMutateArgs) => {
      if (currentIsSaved) {
        // sccContentId가 있으면 그걸 우선 사용하고, 없으면 URL로 unsave.
        // 직전 save 응답 도착 전 빠른 탭 케이스에서도 URL fallback 으로 안전하게 처리된다.
        await api.unsaveContent(
          currentSccContentId ? {sccContentId: currentSccContentId} : {url},
        );
        return {isSaved: false, sccContentId: currentSccContentId ?? undefined};
      } else {
        const {data} = await api.saveContent({
          url,
          contentType,
          webPageDetail: {
            imageUrls,
            ...(title != null ? {title} : {}),
            ...(description != null ? {description} : {}),
          },
        });
        return {isSaved: true, sccContentId: data.sccContentId};
      }
    },
    onMutate: async ({
      url,
      currentIsSaved,
      currentSccContentId,
      upvoteTargetId,
    }) => {
      const cacheKey = [
        SCC_CONTENT_DETAILS_QUERY_KEY_PREFIX,
        url,
        upvoteTargetId ?? null,
      ];

      await queryClient.cancelQueries({queryKey: cacheKey});

      const prev =
        queryClient.getQueryData<GetSccContentDetailsResponseDto>(cacheKey);

      queryClient.setQueryData<GetSccContentDetailsResponseDto>(
        cacheKey,
        old => {
          if (!old) {
            return {
              ...(currentSccContentId
                ? {sccContentId: currentSccContentId}
                : {}),
              isSaved: !currentIsSaved,
              // isUpvoted/totalUpvoteCount는 응답 도착 전까지 unknown → undefined로 두고
              // 다음 refetch 시 서버 값으로 채워진다.
            };
          }
          return {
            ...old,
            isSaved: !currentIsSaved,
          };
        },
      );

      return {prev, cacheKey};
    },
    onSuccess: ({isSaved, sccContentId}, variables, context) => {
      const cacheKey = context.cacheKey;
      // 새로 저장된 경우 캐시에 sccContentId도 반영
      queryClient.setQueryData<GetSccContentDetailsResponseDto>(
        cacheKey,
        old => {
          if (!old) {
            return {
              sccContentId,
              isSaved,
            };
          }
          return {
            ...old,
            sccContentId,
            isSaved,
          };
        },
      );

      // SccContentDetails 캐시는 위에서 setQueryData 로 이미 최신 상태를 반영했으므로,
      // 즉시 refetch 를 트리거하지 않는다 (refetchType: 'none').
      // 즉시 invalidate 하면 background refetch 가 낙관적으로 채운 sccContentId 를 다시 null 로 되돌릴 수 있다.
      queryClient.invalidateQueries({
        queryKey: [SCC_CONTENT_DETAILS_QUERY_KEY_PREFIX, variables.url],
        refetchType: 'none',
      });
      // 저장 목록은 변동이 생겼으므로 refetch 가 필요.
      queryClient.invalidateQueries({queryKey: ['SavedContents']});

      if (isSaved) {
        ToastUtils.show('[메뉴 > 내 저장 > 저장한 컨텐츠]에 저장했습니다.');
      } else {
        ToastUtils.show('저장을 해제했습니다.');
      }

      options?.onSuccess?.({isSaved, url: variables.url});
    },
    onError: (error, _variables, context) => {
      if (context?.prev !== undefined) {
        queryClient.setQueryData(context.cacheKey, context.prev);
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
