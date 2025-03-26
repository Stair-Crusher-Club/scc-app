import React from 'react';
import {ScrollView} from 'react-native';
import {useSetRecoilState} from 'recoil';

import {hasShownGuideForFirstVisitAtom} from '@/atoms/User';
import {ScreenLayout} from '@/components/ScreenLayout';
import {SccButton} from '@/components/atoms';
import {ScreenProps} from '@/navigation/Navigation.screens';

import * as S from './GuideForFirstVisitScreen.style';
import GuideItem from './GuideItem';

export default function GuideForFirstVisitScreen({
  navigation,
}: ScreenProps<'GuideForFirstVisit'>) {
  const setHasShownGuideForFirstVisit = useSetRecoilState(
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
          <S.CoverImage
            source={require('@/assets/img/guide_for_first_visit_astronaut.png')}
          />
          <S.Title>
            안녕하세요!{'\n'}
            계단뿌셔클럽에 처음 오셨나요?
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
        <SccButton text={'확인했어요!'} onPress={onTapConfirmButton} />
      </S.Container>
    </ScreenLayout>
  );
}
