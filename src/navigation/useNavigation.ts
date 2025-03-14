import {
  NavigationProp,
  useNavigation as useNativeNavigation,
} from '@react-navigation/native';

import {ScreenParams} from './Navigation.screens';

export default function useNavigation() {
  return useNativeNavigation<NavigationProp<ScreenParams>>();
}
