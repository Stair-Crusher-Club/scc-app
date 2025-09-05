import {atom} from 'jotai';

// 이벤트 로깅 요소의 고유 키 타입
export interface EventLoggingKey {
  elementName: string;
  params?: Record<string, any>;
}

// Registry 항목 타입
interface RegistryItem {
  count: number;
  components: Set<string>; // 컴포넌트 인스턴스 ID들
}

// Registry 타입
type EventLoggingRegistry = Map<string, RegistryItem>;

// 키를 문자열로 변환하는 함수
export function createRegistryKey(
  elementName: string,
  params?: Record<string, any>,
): string {
  const paramsStr = params
    ? JSON.stringify(
        Object.entries(params).sort(([a], [b]) => a.localeCompare(b)),
      )
    : '';
  return `${elementName}::${paramsStr}`;
}

// Registry atom
export const eventLoggingRegistryAtom = atom<EventLoggingRegistry>(new Map());

// 요소 등록 액션
export const registerElementAtom = atom(
  null,
  (
    get,
    set,
    {
      elementName,
      params,
      componentId,
    }: {elementName: string; params?: Record<string, any>; componentId: string},
  ) => {
    const registry = new Map(get(eventLoggingRegistryAtom));
    const key = createRegistryKey(elementName, params);

    const existing = registry.get(key);
    if (existing) {
      existing.count++;
      existing.components.add(componentId);
    } else {
      registry.set(key, {
        count: 1,
        components: new Set([componentId]),
      });
    }

    set(eventLoggingRegistryAtom, registry);

    // 중복 감지 및 경고
    const item = registry.get(key)!;
    if (item.count >= 2) {
      console.warn(
        `[EventLogging] Duplicate element detected!`,
        `\n  Element Name: ${elementName}`,
        `\n  Params: ${JSON.stringify(params || {})}`,
        `\n  Count: ${item.count}`,
        `\n  Components: [${Array.from(item.components).join(', ')}]`,
        `\n  Registry Key: ${key}`,
      );
    }
  },
);

// 요소 해제 액션
export const unregisterElementAtom = atom(
  null,
  (
    get,
    set,
    {
      elementName,
      params,
      componentId,
    }: {elementName: string; params?: Record<string, any>; componentId: string},
  ) => {
    const registry = new Map(get(eventLoggingRegistryAtom));
    const key = createRegistryKey(elementName, params);

    const existing = registry.get(key);
    if (existing) {
      existing.count--;
      existing.components.delete(componentId);

      if (existing.count <= 0) {
        registry.delete(key);
      }

      set(eventLoggingRegistryAtom, registry);
    }
  },
);
