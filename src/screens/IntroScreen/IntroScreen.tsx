import React, {useEffect} from 'react';
import {useRecoilValue} from 'recoil';

import {accessTokenAtom} from '@/atoms/Auth';
import {ScreenLayout} from '@/components/ScreenLayout';
import {ScreenProps} from '@/navigation/Navigation.screens';

export default function IntroScreen({navigation}: ScreenProps<'Intro'>) {
  const accessToken = useRecoilValue(accessTokenAtom);
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
