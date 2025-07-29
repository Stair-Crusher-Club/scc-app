import {useSetAtom} from 'jotai';
import React, {useEffect} from 'react';
import {Image, Pressable} from 'react-native';
import {match} from 'ts-pattern';

import ExitIcon from '@/assets/icon/ic_exit.svg';
import {
  hasShownGuideForEnterancePhotoAtom,
  hasShownGuideForReviewPhotoAtom,
  hasShownGuideForToiletPhotoAtom,
} from '@/atoms/User';
import {ScreenLayout} from '@/components/ScreenLayout';
import {LogClick} from '@/logging/LogClick';
import {ScreenProps} from '@/navigation/Navigation.screens';

import * as S from './PlacePhotoGuideScreen.style';

export interface PlacePhotoGuideScreenParams {
  target: 'place' | 'review' | 'toilet';
}

export default function PlacePhotoGuideScreen({
  route,
  navigation,
}: ScreenProps<'PlacePhotoGuide'>) {
  const {target} = route.params;
  const setHasShownGuideForEnterancePhoto = useSetAtom(
    hasShownGuideForEnterancePhotoAtom,
  );
  const setHasShownGuideForReviewPhoto = useSetAtom(
    hasShownGuideForReviewPhotoAtom,
  );
  const setHasShownGuideForToiletPhoto = useSetAtom(
    hasShownGuideForToiletPhotoAtom,
  );
  //\u2022
  const guideMessages = match(target)
    .with('place', () => [
      '매장 출입구가 잘 보이는 사진이 유용해요.',
      '첫 장은 간판과 출입문이 보이게, 다음 장은 문턱 위주로 찍어주세요.',
    ])
    .with('review', () => [
      '내부 공간이 잘 보이게 촬영해 주세요',
      '좌석이나 통로가 잘 드러나도록 다양한 각도에서 찍어주시면 좋아요',
    ])
    .with('toilet', () => [
      '내부 공간이 잘 보이게 촬영해 주세요',
      '화장실 넓이, 세면대 높이가 잘 드러나도록 가슴 높이에서 찍어주세요(키 150cm 이상 기준)',
    ])
    .exhaustive();
  useEffect(() => {
    if (target === 'place') {
      setHasShownGuideForEnterancePhoto(true);
    } else if (target === 'review') {
      setHasShownGuideForReviewPhoto(true);
    } else if (target === 'toilet') {
      setHasShownGuideForToiletPhoto(true);
    }
  }, []);
  const guideImage = match(target)
    .with('place', () => require('../../assets/img/guide_entrance.png'))
    .with('review', () => require('../../assets/img/guide_review.png'))
    .with('toilet', () => require('../../assets/img/guide_toilet.png'))
    .exhaustive();

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
        <Image style={{width: '100%', height: '100%'}} source={guideImage} />
      </S.SampleImage>
      <S.GuideMessage>
        <S.GuideMessageTitle>💡사진 촬영 TIP!</S.GuideMessageTitle>
        <S.BulletPoints>
          {guideMessages.map((message, index) => (
            <S.BulletPointContainer key={index}>
              <S.BulletPoint>{'\u2022'}</S.BulletPoint>
              <S.GuideMessageContent>{message}</S.GuideMessageContent>
            </S.BulletPointContainer>
          ))}
        </S.BulletPoints>
        <LogClick elementName="place_photo_guide">
          <Pressable onPress={goToGuide}>
            <S.More>더 알아보기 {'>'}</S.More>
          </Pressable>
        </LogClick>
      </S.GuideMessage>
    </ScreenLayout>
  );
}
