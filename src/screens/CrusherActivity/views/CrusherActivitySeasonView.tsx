import {useMe} from '@/atoms/Auth';
import useAppComponents from '@/hooks/useAppComponents';
import {useQuery} from '@tanstack/react-query';
import React, {useMemo, useState} from 'react';
import {Image, ScrollView, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ActivityItem from '../components/ActivityItem';
import ExpandToggleButton, {
  ExpandToggleButtonStatus,
} from '../components/ExpandToggleButton';
import QuestItem from '../components/QuestItem';
import SectionContainer from '../components/SectionContainer';
import {getCrewAssets} from '../constants';

interface CrusherActivitySeasonViewProps {
  crusherClubId?: string;
  title?: string;
}

export default function CrusherActivitySeasonView({
  crusherClubId,
  title: titleFromProps,
}: CrusherActivitySeasonViewProps) {
  const {api} = useAppComponents();
  const {userInfo} = useMe();
  const insets = useSafeAreaInsets();
  const [questToggleStatus, setQuestToggleStatus] =
    useState<ExpandToggleButtonStatus>('expand');

  const isPastSeason = !!crusherClubId;

  const {data: pastSeasonData} = useQuery({
    queryKey: ['CrusherActivity', crusherClubId],
    queryFn: async () =>
      (await api.getCrusherActivityPost({crusherClubId: crusherClubId!})).data,
    staleTime: 1000 * 5,
    enabled: isPastSeason,
  });

  const {data: currentSeasonData} = useQuery({
    queryKey: ['CrusherActivityPageData'],
    queryFn: async () => (await api.getCrusherActivityPageDataPost()).data,
    staleTime: 1000 * 5,
    enabled: !isPastSeason,
  });

  const crusherActivity = isPastSeason
    ? pastSeasonData?.crusherActivity
    : currentSeasonData?.currentCrusherActivity;

  const crewType = crusherActivity?.crusherClub.crewType;
  const crewAssets = crewType
    ? getCrewAssets(crewType, crusherActivity?.crusherClub.startDate)
    : undefined;

  const originQuests = useMemo(
    () => crusherActivity?.quests ?? [],
    [crusherActivity?.quests],
  );

  const quests = useMemo(() => {
    if (!crewType) return [];
    return questToggleStatus === 'collapse'
      ? originQuests.slice(0, 6)
      : originQuests;
  }, [crewType, questToggleStatus, originQuests]);

  const activityLogs = crusherActivity?.activityLogs ?? [];

  return (
    <ScrollView
      contentContainerClassName="gap-7 px-5 pt-[30px]"
      contentContainerStyle={{paddingBottom: insets.bottom + 60}}>
      <SectionContainer
        title={
          titleFromProps ??
          crusherActivity?.crusherClub.season ??
          "'25 가을 시즌"
        }>
        <View className="flex-row items-center justify-between rounded-[12px] border-[1px] border-gray-15 px-3 py-4">
          <View className="gap-[2px]">
            <Text className="font-pretendard-bold text-[12px] leading-[16px] text-brand-50">
              {crewAssets
                ? `${crewAssets.label}크루`
                : '참여 크러셔 클럽 없음 : 대응 필요'}
            </Text>
            <Text className="font-pretendard-medium text-[18px] leading-[26px] text-gray-90">
              {userInfo?.nickname}
            </Text>
          </View>

          <Image
            source={crewAssets?.source}
            className="h-12 w-[66px]"
            resizeMode="contain"
          />
        </View>
      </SectionContainer>

      <SectionContainer
        title="나의 퀘스트"
        rightComponent={
          <View className="flex-row items-center gap-[2px] rounded-[100px] bg-gray-10 px-2 py-[2px]">
            <Text className="font-pretendard-medium text-[16px] leading-[24px] text-brand-50">
              {originQuests?.filter(q => q.completedAt).length}
            </Text>
            <Text className="font-pretendard-medium text-[16px] leading-[24px] text-gray-50">
              /
            </Text>
            <Text className="font-pretendard-medium text-[16px] leading-[24px] text-gray-50">
              {originQuests?.length}
            </Text>
          </View>
        }>
        <View className="rounded-[12px] border-[1px] border-gray-15 px-3 py-4">
          <View className="flex-row flex-wrap gap-y-4">
            {quests.map(item => (
              <View key={item.id} className="w-1/3">
                {crewType && (
                  <QuestItem
                    title={item.title}
                    completedAt={item.completedAt}
                    source={
                      item.completedAt
                        ? crewAssets?.questMap[item.completeStampType]?.success
                        : crewAssets?.questMap[item.completeStampType]?.empty
                    }
                  />
                )}
              </View>
            ))}
          </View>

          <View className="mt-3 items-center justify-center">
            <ExpandToggleButton
              status={questToggleStatus}
              onPress={() => {
                if (!crewType) {
                  return;
                }

                if (questToggleStatus === 'collapse') {
                  setQuestToggleStatus('expand');
                } else {
                  setQuestToggleStatus('collapse');
                }
              }}
            />
          </View>
        </View>
      </SectionContainer>

      <SectionContainer title="나의 참여">
        <View className="rounded-[12px] border-[1px] border-gray-15 px-3 py-6">
          {activityLogs.length === 0 ? (
            <View className="items-center justify-center gap-3 py-3">
              <Image
                source={require('@/assets/img/img_crusher_history_activities_empty.png')}
                className="h-16 w-16"
              />
              <Text className="text-center font-pretendard-regular text-[16px] leading-[24px] text-gray-50">{`${isPastSeason ? '해당' : '이번'} 시즌 크러셔 클럽\n참석 기록을 확인할 수 있어요`}</Text>
            </View>
          ) : (
            <View>
              {activityLogs.map((item, index) => (
                <React.Fragment key={index}>
                  <ActivityItem
                    activityDoneAt={item.activityDoneAt}
                    title={item.title}
                    visibleLine={
                      activityLogs.length - 1 !== index &&
                      activityLogs.length > 1
                    }
                    isFirst={index === 0}
                    canceledAt={item.canceledAt}
                  />
                  {index < activityLogs.length - 1 && <ActivityItem.Gap />}
                </React.Fragment>
              ))}
            </View>
          )}
        </View>
      </SectionContainer>
    </ScrollView>
  );
}
