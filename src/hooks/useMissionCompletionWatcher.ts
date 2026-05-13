import {useFocusEffect} from '@react-navigation/native';
import {useCallback, useEffect, useMemo, useRef} from 'react';

import {TutorialMissionTypeDto} from '@/generated-sources/openapi';

import {useUserTutorialProgress} from './useUserTutorialProgress';

interface UseMissionCompletionWatcherOptions {
  /** 미션 완료 감지 활성화 여부. false면 콜백을 호출하지 않는다. */
  enabled: boolean;
  /** 감시할 미션 타입. */
  missionType: TutorialMissionTypeDto;
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
 * 마운트 시점의 미션 완료 여부를 "초기 상태"로 기록하고, 이후 변화가 있을 때만
 * 콜백을 호출한다. 화면이 다시 포커스를 받을 때마다 progress를 refetch하여 자식
 * 화면에서 진행한 액션이 즉시 반영되도록 한다.
 */
export function useMissionCompletionWatcher({
  enabled,
  missionType,
  onJustCompleted,
}: UseMissionCompletionWatcherOptions): void {
  const {data: progress, refetch} = useUserTutorialProgress();

  // 화면 포커스 시 progress refetch — 자식 화면(예: PlaceListDetail)에서 진행한
  // 액션 결과가 부모 화면(예: PublicPlaceLists)으로 돌아왔을 때 즉시 반영되도록.
  useFocusEffect(
    useCallback(() => {
      if (enabled) {
        refetch();
      }
    }, [enabled, refetch]),
  );

  const isMissionCompleted = useMemo(
    () =>
      progress?.missions?.some(
        m => m.missionType === missionType && m.completedAt != null,
      ) ?? false,
    [progress, missionType],
  );

  // 마운트 시점에 미션이 이미 완료되어 있었는가?
  // null = 아직 초기 상태 미확정 (tutorial progress 로딩 중)
  const initialCompletionRef = useRef<boolean | null>(null);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    if (progress == null) {
      // 아직 로딩 중. 초기 상태 미확정.
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
  }, [enabled, progress, isMissionCompleted, onJustCompleted]);
}
