import {useAtomValue, useSetAtom} from 'jotai';
import React from 'react';
import {ScrollView} from 'react-native';

import CloseIcon from '@/assets/icon/ic_x_black.svg';
import {isAnonymousUserAtom, useMe} from '@/atoms/Auth';
import {hasShownGuideForFirstVisitAtom} from '@/atoms/User';
import {SccButton} from '@/components/atoms';
import {SccPressable} from '@/components/SccPressable';
import {ScreenLayout} from '@/components/ScreenLayout';
import {ScreenProps} from '@/navigation/Navigation.screens';

import {color} from '@/constant/color';
import {font} from '@/constant/font';
import * as S from './GuideForFirstVisitScreen.style';
import GuideItem from './GuideItem';

export default function GuideForFirstVisitScreen({
  navigation,
}: ScreenProps<'GuideForFirstVisit'>) {
  const {userInfo} = useMe();
  const isAnonymous = useAtomValue(isAnonymousUserAtom);
  const setHasShownGuideForFirstVisit = useSetAtom(
    hasShownGuideForFirstVisitAtom,
  );
  const onTapConfirmButton = () => {
    setHasShownGuideForFirstVisit(true);
    navigation.goBack();
  };

  return (
    <ScreenLayout isHeaderVisible={false} safeAreaEdges={['top', 'bottom']}>
      <S.Container>
        <ScrollView style={{flex: 1}}>
          <S.Header>
            <SccPressable
              onPress={onTapConfirmButton}
              elementName="guide_first_visit_close">
              <CloseIcon width={24} height={24} color={color.black} />
            </SccPressable>
          </S.Header>
          <S.CoverImage
            source={require('@/assets/img/img_challenge_welcome_xl.png')}
          />
          <S.Title>
            {isAnonymous ? (
              `계단뿌셔클럽에 오신 것을\n진심으로 환영합니다.`
            ) : (
              <>
                <S.NicknameText>{userInfo?.nickname}</S.NicknameText>
                {`님\n계단뿌셔클럽에 오신 것을\n진심으로 환영합니다.`}
              </>
            )}
          </S.Title>
          <S.GuideItems>
            <GuideItem
              title="정보 등록은 신중하게 해 주세요"
              description="등록한 정보나 사진은 수정 또는 삭제가 어려워요. 정확한 내용인지 다시 한번 확인해 주세요."
            />
            <GuideItem
              title="앨범에 있는 사진은 등록할 수 없어요"
              description="미리 찍어 둔 사진은 등록할 수 없어요. 현장에서 사진을 바로 찍어서 등록해 주세요."
            />
          </S.GuideItems>
        </ScrollView>
        <SccButton
          text="확인했어요!"
          onPress={onTapConfirmButton}
          fontFamily={font.pretendardSemibold}
          buttonColor="brand40"
          elementName="guide_first_visit_confirm"
          style={{borderRadius: 12}}
        />
      </S.Container>
    </ScreenLayout>
  );
}
