import {useAtomValue} from 'jotai';
import React, {useEffect} from 'react';
import {Controller, useFormContext} from 'react-hook-form';
import {Text, View} from 'react-native';

import {recentlyUsedMobilityToolAtom} from '@/atoms/User';
import PressableChip from '@/components/PressableChip';
import {
  MOBILITY_TOOL_LABELS,
  MOBILITY_TOOL_OPTIONS,
  UserMobilityToolMapDto,
} from '@/constant/review';

import Question from '../components/Question';

export default function UserTypeSection({nickname}: {nickname?: string}) {
  const {watch, setValue} = useFormContext<{
    mobilityTool: UserMobilityToolMapDto;
  }>();
  const recentlyUsedMobilityTool = useAtomValue(recentlyUsedMobilityToolAtom);
  const mobilityTool = watch('mobilityTool');
  const isVisibleLabel = mobilityTool !== 'NONE';

  useEffect(() => {
    if (
      recentlyUsedMobilityTool?.name &&
      recentlyUsedMobilityTool.timestamp > Date.now() - 1000 * 60 * 60 * 24 // 1일
    ) {
      setValue('mobilityTool', recentlyUsedMobilityTool.name);
    }
  }, [recentlyUsedMobilityTool, setValue]);

  return (
    <View className="px-5 py-8 gap-6 bg-white">
      <Text className="font-pretendard-bold text-[20px] leading-[28px]">
        사용한 이동보조기기 유형
      </Text>

      <View className="gap-3">
        <Question required>어떤 이동 수단으로 방문하셨나요?</Question>
        {/* Chip */}
        <View className="flex-row flex-wrap items-start gap-2">
          <Controller
            name="mobilityTool"
            rules={{required: '이동 수단을 선택해주세요'}}
            render={({field}) => (
              <>
                {MOBILITY_TOOL_OPTIONS.filter(
                  ({value}) => value !== 'CLUCH',
                ).map(({label, value}, idx) => (
                  <PressableChip
                    key={label + idx}
                    label={label}
                    active={field.value === value}
                    onPress={() => field.onChange(value)}
                  />
                ))}
              </>
            )}
          />
        </View>
      </View>

      <View className="p-3 bg-gray-10 rounded-[4px] items-center gap-2">
        <Text className="text-gray-60 text-[13px]">
          사용자 유형은 리뷰에서 이렇게 보여요!
        </Text>
        <View className="flex-row gap-1">
          <Text className="font-pretendard-medium text-[13px] leading-[18px]">
            {nickname}
          </Text>
          {isVisibleLabel && (
            <Text className="font-pretendard-medium text-[11px] leading-[14px] text-gray-50 bg-gray-20 rounded-[3px] py-0.5 px-1">
              {MOBILITY_TOOL_LABELS[mobilityTool]}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
