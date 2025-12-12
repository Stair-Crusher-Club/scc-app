import {useIsFocused, usePreventRemove} from '@react-navigation/native';
import {Alert} from 'react-native';

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

  usePreventRemove(isFocused, ({data}) => {
    Alert.alert('페이지를 나가시겠어요?', '작성 중인 내용이 모두 사라져요.', [
      {
        text: '나가기',
        style: 'destructive',
        onPress: () => onConfirmExit(data.action),
      },
      {
        text: '계속 작성하기',
        style: 'cancel',
      },
    ]);
  });
}
