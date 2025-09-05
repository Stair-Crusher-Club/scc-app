import {useAtom} from 'jotai';
import {useEffect, useRef} from 'react';
import {
  registerElementAtom,
  unregisterElementAtom,
} from '@/atoms/EventLoggingRegistry';

// 컴포넌트 인스턴스의 고유 ID를 생성하는 함수
function generateComponentId(): string {
  return `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * SccXxx 컴포넌트에서 이벤트 로깅 요소를 registry에 등록/해제하는 훅
 *
 * @param elementName - 이벤트 요소 이름 (필수)
 * @param params - 이벤트 파라미터 (선택)
 */
export function useEventLoggingRegistry(
  elementName: string,
  params?: Record<string, any>,
) {
  const [, registerElement] = useAtom(registerElementAtom);
  const [, unregisterElement] = useAtom(unregisterElementAtom);
  const componentIdRef = useRef<string | undefined>(undefined);

  // 컴포넌트 인스턴스 ID 생성 (한 번만)
  if (!componentIdRef.current) {
    componentIdRef.current = generateComponentId();
  }

  useEffect(() => {
    const componentId = componentIdRef.current!;

    // 마운트 시 등록
    registerElement({
      elementName,
      params,
      componentId,
    });

    // 언마운트 시 해제
    return () => {
      unregisterElement({
        elementName,
        params,
        componentId,
      });
    };
  }, [elementName, params, registerElement, unregisterElement]);

  return componentIdRef.current;
}
