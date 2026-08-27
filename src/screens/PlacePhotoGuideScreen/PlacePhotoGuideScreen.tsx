import {useSetAtom} from 'jotai';
import React, {useEffect} from 'react';
import {Image} from 'react-native';
import {match} from 'ts-pattern';

import CloseIcon from '@/assets/icon/close.svg';
import {
  hasShownGuideForReviewPhotoAtom,
  hasShownGuideForToiletPhotoAtom,
} from '@/atoms/User';
import {ScreenLayout} from '@/components/ScreenLayout';
import {ScreenProps} from '@/navigation/Navigation.screens';

import * as S from './PlacePhotoGuideScreen.style';

// 입구(장소/건물) 촬영 가이드는 CameraScreen 위 오버레이(EntrancePhotoGuideCarousel)로
// 렌더된다 — 이 화면은 별도 스크린이 필요한 review/toilet 전용이다.
export interface PlacePhotoGuideScreenParams {
  target: 'review' | 'toilet';
}

// 방문리뷰/화장실은 기존 1페이지 가이드를 그대로 유지한다(사용자 확정 사항).
export default function PlacePhotoGuideScreen({
  route,
  navigation,
}: ScreenProps<'PlacePhotoGuide'>) {
  const {target} = route.params;
  const setHasShownGuideForReviewPhoto = useSetAtom(
    hasShownGuideForReviewPhotoAtom,
  );
  const setHasShownGuideForToiletPhoto = useSetAtom(
    hasShownGuideForToiletPhotoAtom,
  );
  useEffect(() => {
    if (target === 'review') {
      setHasShownGuideForReviewPhoto(true);
    } else if (target === 'toilet') {
      setHasShownGuideForToiletPhoto(true);
    }
  }, []);

  const guideMessages = match(target)
    .with('review', () => [
      '내부 공간이 잘 보이게 촬영해 주세요',
      '좌석이나 통로가 잘 드러나도록\n다양한 각도에서 찍어주세요',
    ])
    .with('toilet', () => [
      '내부 공간이 잘 보이게 촬영해 주세요',
      '화장실 넓이, 세면대 높이가 잘 드러나도록\n가슴 높이에서 찍어주세요(키 150cm 이상 기준)',
    ])
    .exhaustive();
  const guideImage = match(target)
    .with('review', () => require('../../assets/img/guide_review.png'))
    .with('toilet', () => require('../../assets/img/guide_toilet.png'))
    .exhaustive();

  return (
    <ScreenLayout
      isHeaderVisible={false}
      safeAreaEdges={['top', 'bottom']}
      style={{backgroundColor: '#262629'}}>
      <S.Header>
        <S.CloseButton
          elementName="place_photo_guide_close_button"
          onPress={navigation.goBack}>
          <CloseIcon width={24} height={24} color="white" />
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
              <S.BulletPoint>{'•'}</S.BulletPoint>
              <S.GuideMessageContent>{message}</S.GuideMessageContent>
            </S.BulletPointContainer>
          ))}
        </S.BulletPoints>
      </S.GuideMessage>
    </ScreenLayout>
  );
}
