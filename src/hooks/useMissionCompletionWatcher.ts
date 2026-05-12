import {useEffect, useRef} from 'react';

interface UseMissionCompletionWatcherOptions {
  /** 미션 완료 감지 활성화 여부. false면 콜백을 호출하지 않는다. */
  enabled: boolean;
  /** 현재 미션 완료 여부 (서버 상태에 기반). */
  isMissionCompleted: boolean;
  /** 미션이 미완료 → 완료로 전환된 시점에 1회 호출되는 콜백. */
  onJustCompleted: () => void;
}

/**
 * 튜토리얼 미션의 미완료 → 완료 전환을 감지하여 콜백을 1회 호출한다.
 *
 * 사용 시나리오: 화면 진입 시 미션이 이미 완료 상태였는지(=오버레이를 띄우면 안 됨),
 * 아니면 사용자가 이 화면에서의 액션 결과로 완료 상태로 전환되었는지(=오버레이를 띄움)를
 * 구분한다.
 *
 * 마운트 시점의 `isMissionCompleted`를 "초기 상태"로 기록하고, 이후 변화가 있을 때만
 * 콜백을 호출한다. 즉, 진입 직후 1번째 render에서 미션이 이미 완료된 경우에는
 * 콜백을 호출하지 않는다.
 */
export function useMissionCompletionWatcher({
  enabled,
  isMissionCompleted,
  onJustCompleted,
}: UseMissionCompletionWatcherOptions): void {
  // 마운트 시점에 미션이 이미 완료되어 있었는가?
  // null = 아직 초기 상태 미확정 (tutorial progress 로딩 중)
  const initialCompletionRef = useRef<boolean | null>(null);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    // 최초 1번만 초기 상태를 기록.
    if (initialCompletionRef.current === null) {
      initialCompletionRef.current = isMissionCompleted;
      return;
    }
    // 이미 콜백을 호출했으면 더 이상 호출하지 않는다.
    if (hasTriggeredRef.current) {
      return;
    }
    // 초기에는 미완료였는데 지금은 완료 → 전환 발생.
    if (!initialCompletionRef.current && isMissionCompleted) {
      hasTriggeredRef.current = true;
      onJustCompleted();
    }
  }, [enabled, isMissionCompleted, onJustCompleted]);
}
