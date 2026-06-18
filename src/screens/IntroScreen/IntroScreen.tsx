import {useIsFocused} from '@react-navigation/native';
import {useAtomValue} from 'jotai';
import React, {useEffect} from 'react';

import {accessTokenAtom} from '@/atoms/Auth';
import {ScreenLayout} from '@/components/ScreenLayout';
import {ScreenProps} from '@/navigation/Navigation.screens';

export default function IntroScreen({navigation}: ScreenProps<'Intro'>) {
  const accessToken = useAtomValue(accessTokenAtom);
  // Only redirect when Intro is the focused route. On web a deep link (e.g.
  // /bbucle-road) puts Intro at the bottom of the stack; without this guard its
  // effect would fire and hijack navigation to Main/Login.
  const isFocused = useIsFocused();
  useEffect(() => {
    if (!isFocused) {
      return;
    }
    if (!accessToken) {
      navigation.replace('Login');
      return;
    } else {
      navigation.replace('Main');
    }
  }, [navigation, isFocused]);

  return <ScreenLayout isHeaderVisible={false} />;
}
