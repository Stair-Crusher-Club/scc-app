import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useState} from 'react';

import {
  AccessibilityInfoV2Dto,
  PlaceAiSummaryDownvoteReasonDto,
  PlaceAiSummaryVoteDto,
} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import ToastUtils from '@/utils/ToastUtils';

const FEEDBACK_THANKS_MESSAGE = '소중한 의견 감사합니다 🙌';

interface DownvoteParams {
  downvoteReason: PlaceAiSummaryDownvoteReasonDto;
  comment?: string;
}

/**
 * PDP AI 접근성 요약 붐업/붐따.
 * 성공 시 캐시의 isFeedbackGiven만 setQueryData로 갱신한다 — invalidateQueries는 절대 호출하지 않는다.
 * refetch가 오면 서버가 isFeedbackGiven=true를 내려줘서 버튼이 즉시 사라지고, "페이지를 벗어나기
 * 전까지는 계속 노출 + 수정 가능"이라는 요구사항이 깨진다. (useUpvoteToggle이 같은 쿼리 키를
 * invalidate하므로, '도움돼요' 클릭만으로도 이 버튼이 사라지는 회귀가 생길 수 있어 특히 주의.)
 */
export function useAiSummaryFeedback(placeId: string) {
  const {api} = useAppComponents();
  const queryClient = useQueryClient();
  const [vote, setVote] = useState<PlaceAiSummaryVoteDto | null>(null);

  const {mutateAsync, isPending} = useMutation({
    mutationFn: (
      params: {vote: PlaceAiSummaryVoteDto} & Partial<DownvoteParams>,
    ) => api.givePlaceAiSummaryFeedbackPost({placeId, ...params}),
  });

  const markFeedbackGiven = () => {
    queryClient.setQueryData<AccessibilityInfoV2Dto | undefined>(
      ['PlaceDetailV2', placeId, 'Accessibility'],
      old =>
        old?.aiSummary
          ? {...old, aiSummary: {...old.aiSummary, isFeedbackGiven: true}}
          : old,
    );
  };

  const giveUpvote = () => {
    if (isPending) {
      return;
    }
    const previousVote = vote;
    setVote(PlaceAiSummaryVoteDto.Up); // 낙관적 갱신 (useUpvoteToggle 패턴)
    mutateAsync({vote: PlaceAiSummaryVoteDto.Up})
      .then(() => {
        ToastUtils.show(FEEDBACK_THANKS_MESSAGE);
        markFeedbackGiven();
      })
      .catch(error => {
        setVote(previousVote);
        ToastUtils.showOnApiError(error);
      });
  };

  /**
   * 붐따는 낙관적으로 갱신하지 않는다 — 바텀시트가 mutateAsync 성공 후에만 닫혀야 하므로,
   * 실패 시 이 함수가 던진 에러를 호출부(바텀시트)가 받아 입력을 보존한 채 시트를 열어둔다.
   */
  const giveDownvote = async (params: DownvoteParams): Promise<void> => {
    try {
      await mutateAsync({vote: PlaceAiSummaryVoteDto.Down, ...params});
    } catch (error) {
      ToastUtils.showOnApiError(error);
      throw error;
    }
    setVote(PlaceAiSummaryVoteDto.Down);
    ToastUtils.show(FEEDBACK_THANKS_MESSAGE);
    markFeedbackGiven();
  };

  return {vote, isPending, giveUpvote, giveDownvote};
}
