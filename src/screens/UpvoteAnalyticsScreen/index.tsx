import React, {useState} from 'react';

import EmptyViewText from '@/components/empty/EmptyViewText';
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

      <ContentContainer>
        {currentTab === 'users' &&
          (isLoading ? (
            <View>
              {Array(5)
                .fill(0)
                .map((_, index) => (
                  <SkeletonContainer key={`user-skeleton-${index}`}>
                    <ProfileImage
                      source={require('@/assets/img/img_profile_big.png')}
                    />
                    <SkeletonWrapper />
                  </SkeletonContainer>
                ))}
            </View>
          ) : (
            <FlashList
              data={data?.upvotedUsers}
              renderItem={({item}) => (
                <UserItemContainer>
                  <ProfileImage
                    source={require('@/assets/img/img_profile_big.png')}
                  />
                  <UserNickname>{item.nickname}</UserNickname>
                </UserItemContainer>
              )}
              ListEmptyComponent={<EmptyViewText>{/* TODO */}</EmptyViewText>}
            />
          ))}

        {currentTab === 'stats' && (
          <FlashList
            data={data?.upvotedUserStatistics}
            renderItem={({item, index}) => (
              <>
                <StatsItemContainer>
                  <StatsLabel>
                    {MOBILITY_TOOL_LABELS[item.mobilityTool]}
                  </StatsLabel>
                  <StatsValueContainer>
                    <StatsPercentage>{item.percentage}%</StatsPercentage>
                    <StatsCount>({item.totalCount}명)</StatsCount>
                  </StatsValueContainer>
                </StatsItemContainer>

                {data?.upvotedUserStatistics &&
                  index !== data?.upvotedUserStatistics?.length - 1 && (
                    <DividerContainer>
                      <Divider />
                    </DividerContainer>
                  )}
              </>
            )}
            ListEmptyComponent={<EmptyViewText>{/* TODO */}</EmptyViewText>}
          />
        )}
      </ContentContainer>
    </ScreenLayout>
  );
}

const ContentContainer = styled.View`
  flex: 1;
`;

const SkeletonContainer = styled.View`
  padding: 20px;
  gap: 12px;
  flex-direction: row;
  align-items: center;
`;

const ProfileImage = styled(Image)`
  width: 32px;
  height: 32px;
`;

const SkeletonWrapper = styled(Skeleton)`
  width: 100px;
  height: 24px;
  border-radius: 8px;
`;

const UserItemContainer = styled.View`
  padding: 20px;
  gap: 12px;
  flex-direction: row;
  align-items: center;
`;

const UserNickname = styled(Text)`
  font-size: 15px;
  line-height: 22px;
  font-family: ${font.pretendardMedium};
`;

const StatsItemContainer = styled.View`
  gap: 12px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
`;

const StatsLabel = styled(Text)`
  font-size: 15px;
  line-height: 22px;
  font-family: ${font.pretendardMedium};
`;

const StatsValueContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const StatsPercentage = styled(Text)`
  font-size: 14px;
  line-height: 20px;
  font-family: ${font.pretendardMedium};
  color: ${color.gray60};
`;

const StatsCount = styled(Text)`
  font-size: 13px;
  line-height: 18px;
  font-family: ${font.pretendardRegular};
  color: ${color.gray40};
`;

const DividerContainer = styled.View`
  padding-horizontal: 20px;
`;

const Divider = styled.View`
  height: 1px;
  background-color: ${color.gray20};
`;
