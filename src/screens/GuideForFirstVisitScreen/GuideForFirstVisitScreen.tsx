import {useSetAtom} from 'jotai';
import React from 'react';

import {useMe} from '@/atoms/Auth';
import {hasShownGuideForFirstVisitAtom} from '@/atoms/User';
import {SccButton} from '@/components/atoms';
import {ScreenLayout} from '@/components/ScreenLayout';
import {ScreenProps} from '@/navigation/Navigation.screens';

import {font} from '@/constant/font';
import * as S from './GuideForFirstVisitScreen.style';

export default function GuideForFirstVisitScreen({
  navigation,
}: ScreenProps<'GuideForFirstVisit'>) {
  const {userInfo} = useMe();
  const setHasShownGuideForFirstVisit = useSetAtom(
    hasShownGuideForFirstVisitAtom,
  );

  const onTapConfirmButton = () => {
    setHasShownGuideForFirstVisit(true);
    navigation.reset({index: 0, routes: [{name: 'Main'}]});
  };

  return (
    <ScreenLayout isHeaderVisible={false} safeAreaEdges={['top', 'bottom']}>
      <S.Container>
        <S.ContentArea>
          <S.CoverImage
            source={require('@/assets/img/img_guide_complete.png')}
          />
          <S.TextContainer>
            <S.TitleLine>
              <S.NicknameText>{userInfo?.nickname}</S.NicknameText>님
            </S.TitleLine>
            <S.TitleLine>앞으로 계단뿌셔클럽과</S.TitleLine>
            <S.TitleLine>더 많은 장소를 찾아봐요!</S.TitleLine>
          </S.TextContainer>
        </S.ContentArea>
        <SccButton
          text="좋아요!"
          onPress={onTapConfirmButton}
          fontSize={18}
          fontFamily={font.pretendardSemibold}
          buttonColor="brand40"
          elementName="guide_first_visit_confirm"
          style={{borderRadius: 8}}
        />
      </S.Container>
    </ScreenLayout>
  );
}
