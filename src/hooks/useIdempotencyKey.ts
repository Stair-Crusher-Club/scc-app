import {useCallback, useRef} from 'react';

export const REQUEST_ID_HEADER = 'X-SCC-REQUEST-ID';
// 등록 API 가 응답 없이 매달리면 버튼이 영원히 pending 이라 앱을 껐다 켜야 했다.
// 끊어도 같은 키로 재시도하면 서버가 첫 응답을 돌려주므로 안전하다.
export const REGISTER_TIMEOUT_MS = 30_000;

/**
 * 화면 진입 1회 동안 같은 입력이면 같은 키를 돌려준다.
 * 서버 SccIdempotencyFilter 가 X-SCC-REQUEST-ID 별로 첫 2xx 응답을 1시간 캐시하므로,
 * 서버는 등록됐는데 클라가 실패로 알고 재시도해도 중복 등록되지 않는다.
 * 입력을 고치면 새 키 — 다른 내용으로 보내는 건 새 요청이다.
 */
export function useIdempotencyKey() {
  const ref = useRef<{input: string; key: string} | null>(null);
  return useCallback((input: unknown): string => {
    const serialized = JSON.stringify(input);
    if (ref.current?.input !== serialized) {
      ref.current = {
        input: serialized,
        key: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      };
    }
    return ref.current.key;
  }, []);
}
