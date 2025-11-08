import React, {useEffect} from 'react';
import SplashScreen from 'react-native-splash-screen';

import * as S from './OTAUpdateDialog.style';

export default function OTAUpdateDialog() {
  useEffect(() => {
    // 업데이트 화면은 업데이트 시간이 길어지는 경우에만 노출한다.
    const timer = setTimeout(() => {
      SplashScreen.hide();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);
  return (
    <S.Container>
      <S.CoverImage source={require('./assets/img/app_logo.png')} />
    </S.Container>
  );
}
