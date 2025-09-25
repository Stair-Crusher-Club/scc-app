import React, {useState} from 'react';

import {ScreenLayout} from '@/components/ScreenLayout';
import Skeleton from '@/components/Skeleton';
import TabBar from '@/components/TabBar';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {MOBILITY_TOOL_LABELS} from '@/constant/mobilityTool';
import {UpvoteTargetTypeDto} from '@/generated-sources/openapi';
import useAppComponents from '@/hooks/useAppComponents';
import {ScreenProps} from '@/navigation/Navigation.screens';
import {FlashList} from '@shopify/flash-list';
import {useQuery} from '@tanstack/react-query';
import {Image, Text, View} from 'react-native';
import styled from 'styled-components/native';

type TabType = 'users' | 'stats';

export interface UpvoteAnalyticsScreenProps {
  targetId: string;
  targetType: UpvoteTargetTypeDto;
}

const tabItems = [
  {value: 'users' as TabType, label: '사용자'},
  {value: 'stats' as TabType, label: '사용자 통계'},
];

export default function UpvoteAnalyticsScreen({
  route,
}: ScreenProps<'UpvoteAnalytics'>) {
  const {targetType, targetId} = route.params;
  const {api} = useAppComponents();
  const [currentTab, setCurrentTab] = useState<TabType>('users');

  const {data, isLoading} = useQuery({
    queryKey: ['UpvoteDetails', targetType, targetId],
    queryFn: async () => {
      return (
        await api.getUpvoteDetailsGet({
          id: targetId,
          targetType,
        })
      ).data;
    },
  });

  return (
    <ScreenLayout isHeaderVisible={true}>
      <TabBar items={tabItems} current={currentTab} onChange={setCurrentTab} />

      <ContentContainer>
        {currentTab === 'users' &&
          (isLoading ? (
            <View>
              {Array(5)
                .fill(0)
                .map((_, index) => (
                  <View
                    key={`user-skelton-${index}`}
                    style={{
                      padding: 20,
                      gap: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Image
                      source={require('@/assets/img/img_profile_big.png')}
                      style={{
                        width: 32,
                        height: 32,
                      }}
                    />
                    <Skeleton
                      style={{
                        width: 100,
                        height: 24,
                        borderRadius: 8,
                      }}
                    />
                  </View>
                ))}
            </View>
          ) : (
            <FlashList
              data={data?.upvotedUsers}
              renderItem={({item}) => (
                <View
                  style={{
                    padding: 20,
                    gap: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <Image
                    source={require('@/assets/img/img_profile_big.png')}
                    style={{
                      width: 32,
                      height: 32,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 15,
                      lineHeight: 22,
                      fontFamily: font.pretendardMedium,
                    }}>
                    {item.nickname}
                  </Text>
                </View>
              )}
              ListEmptyComponent={
                <EmptyViewText>아직 내역이 없어요.</EmptyViewText>
              }
            />
          ))}

        {currentTab === 'stats' && (
          <FlashList
            data={data?.upvotedUserStatistics}
            renderItem={({item, index}) => (
              <>
                <View
                  style={{
                    gap: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 20,
                  }}>
                  <Text
                    style={{
                      fontSize: 15,
                      lineHeight: 22,
                      fontFamily: font.pretendardMedium,
                    }}>
                    {MOBILITY_TOOL_LABELS[item.mobilityTool]}
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                    }}>
                    <Text
                      style={{
                        fontSize: 14,
                        lineHeight: 20,
                        fontFamily: font.pretendardMedium,
                        color: color.gray60,
                      }}>
                      {item.percentage}%
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        lineHeight: 18,
                        fontFamily: font.pretendardRegular,
                        color: color.gray40,
                      }}>
                      ({item.totalCount}명)
                    </Text>
                  </View>
                </View>

                {data?.upvotedUserStatistics &&
                  index !== data?.upvotedUserStatistics?.length - 1 && (
                    <View
                      style={{
                        paddingHorizontal: 20,
                      }}>
                      <View
                        style={{
                          height: 1,
                          backgroundColor: color.gray20,
                        }}
                      />
                    </View>
                  )}
              </>
            )}
            ListEmptyComponent={
              <EmptyViewText>아직 내역이 없어요.</EmptyViewText>
            }
          />
        )}
      </ContentContainer>
    </ScreenLayout>
  );
}

const ContentContainer = styled.View`
  flex: 1;
`;

const EmptyViewText = styled.Text`
  font-size: 14px;
  font-family: ${() => font.pretendardMedium};
  color: ${() => color.gray50};
  align-items: center;
  text-align: center;
  padding-top: 60px;
`;
