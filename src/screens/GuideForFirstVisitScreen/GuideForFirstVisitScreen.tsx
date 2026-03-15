import {useSetAtom} from 'jotai';
import React from 'react';
import {Image, Text, View} from 'react-native';

import {useMe} from '@/atoms/Auth';
import {hasShownGuideForFirstVisitAtom} from '@/atoms/User';
import {SccButton} from '@/components/atoms';
import {ScreenLayout} from '@/components/ScreenLayout';
import {ScreenProps} from '@/navigation/Navigation.screens';

import {font} from '@/constant/font';

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
      <View className="flex-1 bg-white px-[20px] pb-[20px]">
        <View className="flex-1 items-center pt-[120px]">
          <Image
            className="h-[223px] w-[200px] self-center"
            source={require('@/assets/img/img_guide_complete.png')}
          />
          <View className="mt-[32px] items-center gap-[4px]">
            <Text className="text-center font-pretendard-semibold text-[22px] leading-[30px] tracking-[-0.44px] text-[#16181c]">
              <Text className="font-pretendard-semibold text-[22px] leading-[30px] tracking-[-0.44px] text-brand-50">
                {userInfo?.nickname}
              </Text>
              님
            </Text>
            <Text className="text-center font-pretendard-semibold text-[22px] leading-[30px] tracking-[-0.44px] text-[#16181c]">
              앞으로 계단뿌셔클럽과
            </Text>
            <Text className="text-center font-pretendard-semibold text-[22px] leading-[30px] tracking-[-0.44px] text-[#16181c]">
              더 많은 장소를 찾아봐요!
            </Text>
          </View>
        </View>
        <SccButton
          text="좋아요!"
          onPress={onTapConfirmButton}
          fontSize={18}
          fontFamily={font.pretendardSemibold}
          buttonColor="brand40"
          elementName="guide_first_visit_confirm"
          style={{borderRadius: 8}}
        />
      </View>
    </ScreenLayout>
  );
}
