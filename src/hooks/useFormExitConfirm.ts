import {useIsFocused, usePreventRemove} from '@react-navigation/native';
import {useCallback, useRef, useState} from 'react';

/**
 * Form 화면에서 뒤로 가기 시 확인 modal을 띄우기 위한 hook.
 *
 * @param onConfirmExit 사용자가 modal에서 "나가기"를 확정했을 때 실행할 navigation action 처리 콜백.
 * @param options.enabled true일 때만 뒤로 가기 시 확인 modal을 trigger. 기본값 true.
 *   form이 dirty하지 않으면 false로 전달하여 사용자가 자유롭게 뒤로 갈 수 있도록 한다.
 *
 * 반환값의 `bypass`는 저장 완료 직후 등 dirty 상태이지만 확인 modal 없이 즉시
 * 화면을 떠나야 할 때 사용한다. `bypass()` 호출 직후 navigation.goBack()을 부르면
 * usePreventRemove 콜백에서 확인 modal을 건너뛴다.
 * (단순히 `enabled=false`로 바꾸는 것은 React state 업데이트가 비동기라
 * 같은 tick의 goBack에는 반영되지 않으므로 ref 기반 우회 경로가 필요하다.)
 */
export function useFormExitConfirm(
  onConfirmExit: (
    action: Readonly<{
      type: string;
      payload?: object;
      source?: string;
      target?: string;
    }>,
  ) => void,
  options?: {enabled?: boolean},
) {
  const enabled = options?.enabled ?? true;
  const isFocused = useIsFocused();
  const [isVisible, setIsVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState<Readonly<{
    type: string;
    payload?: object;
    source?: string;
    target?: string;
  }> | null>(null);
  const bypassRef = useRef(false);

  usePreventRemove(isFocused && enabled, ({data}) => {
    if (bypassRef.current) {
      // bypass 직후 발생한 remove 이벤트이므로 원본 action을 그대로 dispatch하고
      // ref를 초기화한다. 확인 modal을 띄우지 않는다.
      bypassRef.current = false;
      onConfirmExit(data.action);
      return;
    }
    setPendingAction(data.action);
    setIsVisible(true);
  });

  const onConfirm = () => {
    setIsVisible(false);
    if (pendingAction) {
      onConfirmExit(pendingAction);
    }
  };

  const onCancel = () => {
    setIsVisible(false);
    setPendingAction(null);
  };

  const bypass = useCallback(() => {
    bypassRef.current = true;
  }, []);

  return {
    isVisible,
    onConfirm,
    onCancel,
    bypass,
  };
}
