import {useIsFocused, usePreventRemove} from '@react-navigation/native';
import {useState} from 'react';

export function useFormExitConfirm(
  onConfirmExit: (
    action: Readonly<{
      type: string;
      payload?: object;
      source?: string;
      target?: string;
    }>,
  ) => void,
) {
  const isFocused = useIsFocused();
  const [isVisible, setIsVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState<Readonly<{
    type: string;
    payload?: object;
    source?: string;
    target?: string;
  }> | null>(null);

  usePreventRemove(isFocused, ({data}) => {
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
