import {useQuery} from '@tanstack/react-query';
import {useAtomValue} from 'jotai';
import {useEffect, useState} from 'react';

import {AlternativeSearchSuggestionDto} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import {searchRequestIdAtom} from '@/screens/SearchScreen/atoms';

/**
 * 스냅 완료 후 이만큼 머물러야 요청한다. 스쳐 지나간 카드는 서버에 도달하지 않는다.
 */
const SETTLE_DEBOUNCE_MS = 250;
/**
 * 이보다 늦은 응답은 결과 없음과 동일하게 처리한다. CTA는 늦게 떠도 의미가 없다.
 *
 * 3000ms 였을 때 제안 OK 의 58%(147/253)가 버려졌다 — 시뮬레이션이 카카오 외부 API 를 타면
 * elapsedMs 가 5.1~5.9초로 몰렸기 때문(2026-08 실측). 그 지연 자체는 서버에서 고쳤으므로
 * (SearchPlacesUseCase.SIMULATION_EXTERNAL_TIMEOUT_MS) 응답은 1~2초에 들어온다.
 * 5000ms 는 그 뒤의 여유분이다 — 이 값을 다시 줄이려면 서버 elapsedMs 분포를 먼저 확인할 것.
 */
const REQUEST_TIMEOUT_MS = 5000;

/**
 * 포커스된 카드의 대체 검색 제안을 가져온다. 제안이 없으면 null.
 *
 * **"이 검색에서 대체 검색 CTA가 적절한가"는 이 훅의 관심사가 아니다** — 그 판단은
 * 화면(SearchScreen)이 하고, 이 훅은 마운트된 동안 포커스된 카드의 제안만 책임진다.
 *
 * 로딩 인디케이터를 두지 않는다 — 결과가 없을 수 있는 CTA에서 스피너는 지킬 수 없는 약속이 된다.
 * 대신 요청을 포커스가 확정된 카드 1건으로 좁힌다(디바운스).
 *
 * 캐시·취소·늦은 응답 폐기는 React Query가 queryKey 단위로 처리한다. 직접 구현하면
 * 취소된 요청의 rejection이 방금 포커스된 카드의 상태를 덮어쓰는 류의 버그가 생긴다.
 */
export function useAlternativeSearchSuggestion({
  focusedPlaceId,
  currentSearchText,
  hasAccessiblePlaceInResults,
}: {
  focusedPlaceId: string | null;
  currentSearchText: string | null;
  /**
   * 현재 결과 목록에 접근레벨 2 이하 장소가 있는지. 제안 여부 판정은 서버가 하는데,
   * 서버는 사용자가 렌더한 결과셋(필터·지도 영역 포함)을 알 수 없어서 이 사실만 넘겨준다.
   */
  hasAccessiblePlaceInResults: boolean;
}): AlternativeSearchSuggestionDto | null {
  const {api} = useAppComponents();
  const searchRequestId = useAtomValue(searchRequestIdAtom);

  // 스냅이 끝나고 SETTLE_DEBOUNCE_MS 동안 머문 카드만 요청 대상이 된다.
  const [settledPlaceId, setSettledPlaceId] = useState<string | null>(null);
  useEffect(() => {
    if (!focusedPlaceId) {
      setSettledPlaceId(null);
      return;
    }
    const timer = setTimeout(
      () => setSettledPlaceId(focusedPlaceId),
      SETTLE_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [focusedPlaceId]);

  const {data} = useQuery<AlternativeSearchSuggestionDto | null>({
    // searchRequestId를 키에 넣어 재검색(지도 영역 변경 포함) 시 이전 판단을 쓰지 않게 한다.
    // hasAccessiblePlaceInResults 도 키에 넣는다 — 서버 판정의 입력이라, 빼면 값이 바뀌어도
    // 캐시된 이전 판정이 그대로 재사용된다.
    queryKey: [
      'alternativeSearchSuggestion',
      searchRequestId,
      settledPlaceId,
      currentSearchText,
      hasAccessiblePlaceInResults,
    ],
    enabled: !!settledPlaceId,
    // 같은 검색 안에서는 카드마다 한 번만 물어본다.
    // (gcTime은 기본값을 쓴다 — 지난 검색의 캐시까지 세션 내내 붙들고 있을 이유가 없다)
    staleTime: Infinity,
    retry: false,
    // 실패·타임아웃은 "제안 없음"과 동일하게 조용히 처리한다. 토스트를 띄우지 않는다.
    throwOnError: false,
    queryFn: async ({signal}) => {
      try {
        const response = await api.getAlternativeSearchSuggestion(
          {
            placeId: settledPlaceId!,
            currentSearchText: currentSearchText ?? '',
            hasAccessiblePlaceInResults,
          },
          {signal, timeout: REQUEST_TIMEOUT_MS},
        );
        return response.data.suggestion ?? null;
      } catch {
        return null;
      }
    },
  });

  // 아직 확정되지 않았거나 다른 카드의 결과면 노출하지 않는다.
  return settledPlaceId === focusedPlaceId ? (data ?? null) : null;
}
