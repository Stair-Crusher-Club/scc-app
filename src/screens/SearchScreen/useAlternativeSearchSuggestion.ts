import {useAtomValue} from 'jotai';
import {useEffect, useRef, useState} from 'react';

import {AlternativeSearchSuggestionDto} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import {
  isAlternativeSearchAtom,
  searchModeAtom,
  searchRequestIdAtom,
} from '@/screens/SearchScreen/atoms';

/**
 * 스냅 완료 후 이만큼 머물러야 요청한다. 스쳐 지나간 카드는 서버에 도달하지 않는다.
 */
const SETTLE_DEBOUNCE_MS = 250;
/**
 * 이보다 늦은 응답은 결과 없음과 동일하게 처리한다. CTA는 늦게 떠도 의미가 없다.
 */
const REQUEST_TIMEOUT_MS = 3000;

/**
 * 포커스된 카드에 대해 "주위 다른 OOO 확인하기" CTA를 띄울지 서버에 물어본다.
 *
 * 로딩 인디케이터를 두지 않는다 — 결과가 없을 수 있는 CTA에서 스피너는 지킬 수 없는 약속이 된다.
 * 대신 요청을 포커스가 확정된 카드 1건으로 좁히고(디바운스), 결과를 카드별로 캐시한다.
 */
export function useAlternativeSearchSuggestion({
  focusedPlaceId,
  currentSearchText,
  isEnabled,
}: {
  focusedPlaceId: string | null;
  currentSearchText: string | null;
  isEnabled: boolean;
}): {
  /**
   * 이번 검색에서 CTA가 뜰 수 있는 상황인지. false면 어느 카드에서도 뜨지 않으므로
   * 슬롯 자리조차 잡지 않는다 (안 잡으면 화장실 검색/일반 검색의 기존 레이아웃이 밀린다).
   */
  isActive: boolean;
  suggestion: AlternativeSearchSuggestionDto | null;
} {
  const {api} = useAppComponents();
  const searchRequestId = useAtomValue(searchRequestIdAtom);
  const searchMode = useAtomValue(searchModeAtom);
  const isAlternativeSearch = useAtomValue(isAlternativeSearchAtom);

  const [state, setState] = useState<{
    placeId: string;
    suggestion: AlternativeSearchSuggestionDto | null;
  } | null>(null);

  // 카드 id -> 결과. 검색이 바뀌면(지도 영역 변경/재검색 포함) 통째로 버린다.
  const cacheRef = useRef(
    new Map<string, AlternativeSearchSuggestionDto | null>(),
  );
  useEffect(() => {
    cacheRef.current.clear();
    setState(null);
  }, [searchRequestId]);

  const isActive =
    isEnabled &&
    !isAlternativeSearch &&
    searchMode === 'place' &&
    !!currentSearchText;

  useEffect(() => {
    if (!isActive || !focusedPlaceId) {
      setState(null);
      return;
    }

    const cached = cacheRef.current.get(focusedPlaceId);
    if (cached !== undefined) {
      setState({placeId: focusedPlaceId, suggestion: cached});
      return;
    }
    setState(null);

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      SETTLE_DEBOUNCE_MS + REQUEST_TIMEOUT_MS,
    );
    const debounce = setTimeout(async () => {
      try {
        const response = await api.getAlternativeSearchSuggestion(
          {placeId: focusedPlaceId, currentSearchText: currentSearchText ?? ''},
          {signal: controller.signal},
        );
        const suggestion = response.data.suggestion ?? null;
        cacheRef.current.set(focusedPlaceId, suggestion);
        setState({placeId: focusedPlaceId, suggestion});
      } catch {
        // 실패/타임아웃은 "제안 없음"과 동일하게 조용히 처리한다. 다시 포커스되면 재시도.
        setState({placeId: focusedPlaceId, suggestion: null});
      }
    }, SETTLE_DEBOUNCE_MS);

    return () => {
      clearTimeout(debounce);
      clearTimeout(timeout);
      controller.abort();
    };
  }, [api, isActive, focusedPlaceId, currentSearchText]);

  return {
    isActive,
    // 늦게 도착한 응답이 다른 카드에 붙지 않게 id를 대조한다.
    suggestion: state?.placeId === focusedPlaceId ? state.suggestion : null,
  };
}
