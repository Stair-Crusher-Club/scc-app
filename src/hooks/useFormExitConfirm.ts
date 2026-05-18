import {useIsFocused, usePreventRemove} from '@react-navigation/native';
import {useState} from 'react';

/**
 * Form 화면에서 뒤로 가기 시 확인 modal을 띄우기 위한 hook.
 *
 * @param onConfirmExit 사용자가 modal에서 "나가기"를 확정했을 때 실행할 navigation action 처리 콜백.
 * @param options.enabled true일 때만 뒤로 가기 시 확인 modal을 trigger. 기본값 true.
 *   form이 dirty하지 않으면 false로 전달하여 사용자가 자유롭게 뒤로 갈 수 있도록 한다.
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

  usePreventRemove(isFocused && enabled, ({data}) => {
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

  return {
    isVisible,
    onConfirm,
    onCancel,
  };
}
