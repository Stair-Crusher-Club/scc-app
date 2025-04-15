import {useAtomValue} from 'jotai';
import React, {useEffect} from 'react';

import {accessTokenAtom} from '@/atoms/Auth';
import {ScreenLayout} from '@/components/ScreenLayout';
import {ScreenProps} from '@/navigation/Navigation.screens';

export default function IntroScreen({navigation}: ScreenProps<'Intro'>) {
  const accessToken = useAtomValue(accessTokenAtom);
  useEffect(() => {
    if (!accessToken) {
      navigation.replace('Login');
      return;
    } else {
      navigation.replace('Main');
    }
  }, [navigation]);

  return <ScreenLayout isHeaderVisible={false} />;
}
