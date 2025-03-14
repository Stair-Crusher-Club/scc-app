import React, {useEffect} from 'react';
import {Image, Pressable} from 'react-native';
import {useSetRecoilState} from 'recoil';

import ExitIcon from '@/assets/icon/ic_exit.svg';
import {hasShownGuideForEnterancePhotoAtom} from '@/atoms/User';
import {ScreenLayout} from '@/components/ScreenLayout';
import {LogClick} from '@/logging/LogClick';
import {ScreenProps} from '@/navigation/Navigation.screens';

import * as S from './PlacePhotoGuideScreen.style';

export default function PlacePhotoGuideScreen({
  navigation,
}: ScreenProps<'PlacePhotoGuide'>) {
  const setHasShownGuideForEnterancePhoto = useSetRecoilState(
    hasShownGuideForEnterancePhotoAtom,
  );
  useEffect(() => {
    setHasShownGuideForEnterancePhoto(true);
  }, []);

  function goToGuide() {
    navigation.navigate('Webview', {
      url: 'https://agnica.notion.site/b43c00d499f74083a679db7af91828bc',
    });
  }

  return (
    <ScreenLayout
      isHeaderVisible={false}
      safeAreaEdges={['top', 'bottom']}
      style={{backgroundColor: '#262629'}}>
      <S.Header>
        <S.CloseButton onPress={navigation.goBack}>
          <ExitIcon width={24} height={24} color="white" />
        </S.CloseButton>
      </S.Header>
      <S.SampleImage>
        <Image
          style={{width: '100%', height: '100%'}}
          source={require('../../assets/img/enterance-guide.png')}
        />
      </S.SampleImage>
      <S.GuideMessage>
        <S.GuideMessageTitle>💡사진 촬영 TIP!</S.GuideMessageTitle>
        <S.GuideMessageContent>
          {`\
\u2022  매장 출입구가 잘 보이는 사진이 유용해요.
\u2022  첫 장은 간판과 출입문이 보이게,
    다음 장은 문턱 위주로 찍어주세요.`}
        </S.GuideMessageContent>
        <LogClick elementName="place_photo_guide">
          <Pressable onPress={goToGuide}>
            <S.More>더 알아보기 {'>'}</S.More>
          </Pressable>
        </LogClick>
      </S.GuideMessage>
    </ScreenLayout>
  );
}
