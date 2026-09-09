import React from 'react';
import {Text, View} from 'react-native';

import ChallengeRank from '@/components/ChallengeRank';
import {ChallengeRankDto} from '@/generated-sources/openapi';

interface PropsType {
  ranks: ChallengeRankDto[];
}

const TopTenRank = ({ranks}: PropsType) => {
  return (
    <View className="px-[20px] gap-[12px]">
      <Text className="text-[20px] leading-[28px] tracking-[-0.4px] font-pretendard-bold text-black">
        챌린지 랭킹
      </Text>
      <View className="border border-gray-v2-15 rounded-[12px] py-[5px]">
        {ranks.map((rank, index) => (
          <ChallengeRank
            key={rank.nickname}
            value={rank}
            shouldShowUnderline={index < ranks.length - 1}
          />
        ))}
      </View>
      <Text className="text-[13px] leading-[18px] tracking-[-0.26px] text-gray-v2-50">
        정복수는 실시간으로 갱신되며, 랭킹은 10분 단위로 업데이트됩니다.
      </Text>
    </View>
  );
};

export default TopTenRank;
