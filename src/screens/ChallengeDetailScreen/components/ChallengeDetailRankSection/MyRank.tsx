import React from 'react';
import {Image, Text, View} from 'react-native';

import ChallengeRank from '@/components/ChallengeRank';
import {color} from '@/constant/color';
import {ChallengeRankDto} from '@/generated-sources/openapi';

interface PropsType {
  myRank: ChallengeRankDto;
}

const MyRank = ({myRank}: PropsType) => {
  const shouldShowBubble = myRank.rank === 1;
  return (
    <View className="px-[20px] gap-[12px]">
      <Text className="text-[20px] leading-[28px] tracking-[-0.4px] font-pretendard-bold text-black">
        나의 랭킹
      </Text>
      <View className="border border-gray-v2-15 rounded-[12px] p-[20px]">
        <ChallengeRank
          value={myRank}
          shouldShowUnderline={false}
          visibleIcon={false}
          containerClassName="p-0"
        />
      </View>
      {shouldShowBubble && (
        <View className="flex-col items-start mt-[2px]">
          {/* ponytail: Image tintColor/rotate 는 className 대응 유틸이 없어 style 유지 (7-4 예외와 동일 성격) */}
          <Image
            source={require('../../../../assets/img/img_challenge_bubble_tail.png')}
            className="w-[16px] h-[8px] ml-[30px]"
            style={{transform: [{rotateZ: '180deg'}], tintColor: color.brand50}}
          />
          <View className="w-full flex-row items-center rounded-[12px] bg-brand-50">
            <Text className="text-white text-[14px] font-pretendard-regular ml-[20px]">
              {'내가 바로 이 구역의\n'}
              <Text className="font-pretendard-bold">계단정복왕!</Text>
            </Text>
            <View className="flex-1" />
            <Image
              source={require('../../../../assets/img/img_challenge_my_rank.png')}
              className="h-full mr-[10px] aspect-[130/72]"
            />
          </View>
        </View>
      )}
    </View>
  );
};

export default MyRank;
