import React, {useState} from 'react';

import EmptyViewText from '@/components/empty/EmptyViewText';
import {ScreenLayout} from '@/components/ScreenLayout';
import Skeleton from '@/components/Skeleton';
import TabBar from '@/components/TabBar';
import {MOBILITY_TOOL_LABELS} from '@/constant/mobilityTool';
import {UpvoteTargetTypeDto} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import {ScreenProps} from '@/navigation/Navigation.screens';
import {FlashList} from '@shopify/flash-list';
import {useQuery} from '@tanstack/react-query';
import {Image, Text, View} from 'react-native';
import {INITIAL_TAB, tabItems} from './constants';
import type {TabType} from './types';

export interface UpvoteAnalyticsScreenProps {
  targetId: string;
  targetType: UpvoteTargetTypeDto;
}

export default function UpvoteAnalyticsScreen({
  route,
}: ScreenProps<'UpvoteAnalytics'>) {
  const {targetType, targetId} = route.params;
  const {api} = useAppComponents();
  const [currentTab, setCurrentTab] = useState<TabType>(INITIAL_TAB);

  const {data, isLoading} = useQuery({
    queryKey: ['UpvoteDetails', targetType, targetId],
    queryFn: async () => {
      return (
        await api.getUpvoteDetailsPost({
          id: targetId,
          targetType,
        })
      ).data;
    },
  });

  return (
    <ScreenLayout isHeaderVisible={true}>
      <TabBar items={tabItems} current={currentTab} onChange={setCurrentTab} />

      <View className="flex-1">
        {currentTab === 'users' &&
          (isLoading ? (
            <View>
              {Array(5)
                .fill(0)
                .map((_, index) => (
                  <View
                    key={`user-skeleton-${index}`}
                    className="p-[20px] gap-[12px] flex-row items-center">
                    <Image
                      source={require('@/assets/img/img_profile_big.png')}
                      className="w-[32px] h-[32px]"
                    />
                    <Skeleton className="w-[100px] h-[24px] rounded-[8px]" />
                  </View>
                ))}
            </View>
          ) : (
            <FlashList
              data={data?.upvotedUsers}
              renderItem={({item}) => (
                <View className="p-[20px] gap-[12px] flex-row items-center">
                  <Image
                    source={require('@/assets/img/img_profile_big.png')}
                    className="w-[32px] h-[32px]"
                  />
                  <Text
                    className="font-pretendard-medium"
                    style={{fontSize: 15, lineHeight: 22}}>
                    {item.nickname}
                  </Text>
                </View>
              )}
              ListEmptyComponent={<EmptyViewText>{/* TODO */}</EmptyViewText>}
            />
          ))}

        {currentTab === 'stats' && (
          <FlashList
            data={data?.upvotedUserStatistics}
            renderItem={({item, index}) => (
              <>
                <View className="gap-[12px] flex-row items-center justify-between p-[20px]">
                  <Text
                    className="font-pretendard-medium"
                    style={{fontSize: 15, lineHeight: 22}}>
                    {MOBILITY_TOOL_LABELS[item.mobilityTool]}
                  </Text>
                  <View className="flex-row items-center gap-[4px]">
                    <Text
                      className="font-pretendard-medium text-gray-60"
                      style={{fontSize: 14, lineHeight: 20}}>
                      {item.percentage}%
                    </Text>
                    <Text
                      className="font-pretendard-regular text-gray-40"
                      style={{fontSize: 13, lineHeight: 18}}>
                      ({item.totalCount}명)
                    </Text>
                  </View>
                </View>

                {data?.upvotedUserStatistics &&
                  index !== data?.upvotedUserStatistics?.length - 1 && (
                    <View className="px-[20px]">
                      <View className="h-[1px] bg-gray-20" />
                    </View>
                  )}
              </>
            )}
            ListEmptyComponent={<EmptyViewText>{/* TODO */}</EmptyViewText>}
          />
        )}
      </View>
    </ScreenLayout>
  );
}
