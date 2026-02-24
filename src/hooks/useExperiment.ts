import {experimentAtom, experimentOverrideAtom} from '@/atoms/Auth';
import {useAtomValue} from 'jotai';

export function useExperimentVariant(experimentName: string): string {
  const experiments = useAtomValue(experimentAtom);
  const overrides = useAtomValue(experimentOverrideAtom);

  // 오버라이드가 있으면 우선 적용 (DevTool에서 설정)
  if (overrides[experimentName]) {
    return overrides[experimentName];
  }
  return experiments?.[experimentName] ?? 'CONTROL';
}

/** 도움돼요 버튼 A/B 테스트: TREATMENT이면 아이콘만 버튼 */
export function useIsUpvoteIconOnly(): boolean {
  return useExperimentVariant('UPVOTE_BUTTON_STYLE') === 'TREATMENT';
}
