import {useMe} from '@/atoms/Auth';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import useAppComponents from '@/hooks/useAppComponents';
import {FlashList} from '@shopify/flash-list';
import {useQuery} from '@tanstack/react-query';
import React, {useEffect, useState} from 'react';
import {Image, ScrollView, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ActivityItem from '../components/ActivityItem';
import ExpandToggleButton, {
  ExpandToggleButtonStatus,
} from '../components/ExpandToggleButton';
import QuestItem from '../components/QuestItem';
import SectionContainer from '../components/SectionContainer';
import {crewInfoAssets} from '../constants';

export default function CurrentSeasonView() {
  const {api} = useAppComponents();
  const {userInfo} = useMe();
  const insets = useSafeAreaInsets();
  const [questToggleStatus, setQuestToggleStatus] =
    useState<ExpandToggleButtonStatus>('expand');
  const {data} = useQuery({
    queryKey: ['CurrentCrusherActivity'],
    queryFn: async () => (await api.getCurrentCrusherActivityPost()).data,
    staleTime: 1000 * 5,
  });

  const crewType = data?.currentCrusherActivity?.crusherClub.crewType;

  const originQuests = data?.currentCrusherActivity?.quests ?? [];

  const [quests, setQuests] = useState(
    crewType
      ? questToggleStatus === 'collapse'
        ? originQuests.slice(0, 6)
        : originQuests
      : [],
  );

  useEffect(() => {
    if (questToggleStatus === 'expand') {
      setQuests(originQuests);
    } else {
      setQuests(originQuests.slice(0, 6));
    }
  }, [questToggleStatus, originQuests]);

  const activityLogs = data?.currentCrusherActivity?.activityLogs ?? [];

  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: insets.bottom + 60,
        gap: 28,
      }}>
      <SectionContainer
        title={
          data?.currentCrusherActivity?.crusherClub.season ?? '25’ 가을 시즌'
        }>
        <View
          style={{
            borderWidth: 1,
            borderColor: '#F2F2F5',
            padding: 12,
            borderRadius: 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View style={{gap: 2}}>
            <Text
              style={{
                fontSize: 12,
                fontFamily: font.pretendardBold,
                color: color.brand50,
                lineHeight: 16,
              }}>
              {crewType
                ? `${crewInfoAssets[crewType].label}크루`
                : '참여 크러셔 클럽 없음 : 대응 필요'}
            </Text>
            <Text
              style={{
                fontSize: 18,
                fontFamily: font.pretendardMedium,
                color: color.gray90,
                lineHeight: 26,
              }}>
              {userInfo?.nickname}
            </Text>
          </View>

          <Image
            source={crewType ? crewInfoAssets[crewType].source : undefined}
            style={{
              width: 66,
              height: 48,
            }}
          />
        </View>
      </SectionContainer>

      <SectionContainer
        title="나의 퀘스트"
        rightComponent={
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 2,
              borderRadius: 100,
              backgroundColor: color.gray10,
              paddingVertical: 2,
              paddingHorizontal: 8,
            }}>
            <Text
              style={{
                fontSize: 16,
                lineHeight: 24,
                fontFamily: font.pretendardMedium,
                color: color.brand50,
              }}>
              {originQuests?.filter(q => q.completedAt).length}
            </Text>
            <Text
              style={{
                fontSize: 16,
                lineHeight: 24,
                fontFamily: font.pretendardMedium,
                color: color.gray50,
              }}>
              /
            </Text>
            <Text
              style={{
                fontSize: 16,
                lineHeight: 24,
                fontFamily: font.pretendardMedium,
                color: color.gray50,
              }}>
              {originQuests?.length}
            </Text>
          </View>
        }>
        <View
          style={{
            borderWidth: 1,
            borderColor: '#F2F2F5',
            paddingVertical: 16,
            paddingHorizontal: 12,
            borderRadius: 12,
          }}>
          <FlashList
            data={quests}
            keyExtractor={item => item.id}
            renderItem={({item}) => {
              if (!crewType) {
                return null;
              }

              return (
                <QuestItem
                  title={item.title}
                  completedAt={item.completedAt}
                  source={
                    item.completedAt
                      ? crewInfoAssets[crewType].questMap[
                          item.completeStampType
                        ]?.success
                      : crewInfoAssets[crewType].questMap[
                          item.completeStampType
                        ]?.empty
                  }
                />
              );
            }}
            numColumns={3}
            ItemSeparatorComponent={QuestItem.Gap}
          />

          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 12,
            }}>
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
        <View
          style={{
            borderWidth: 1,
            borderColor: '#F2F2F5',
            paddingVertical: 16,
            paddingHorizontal: 12,
            borderRadius: 12,
          }}>
          <FlashList
            data={activityLogs}
            renderItem={({item, index}) => (
              <ActivityItem
                activityDoneAt={item.activityDoneAt}
                title={item.title}
                visibleLine={
                  activityLogs.length - 1 !== index && activityLogs.length > 1
                }
              />
            )}
            ItemSeparatorComponent={ActivityItem.Gap}
            ListEmptyComponent={
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 12,
                  paddingVertical: 12,
                }}>
                <Image
                  source={require('@/assets/img/img_crusher_history_activities_empty.png')}
                  style={{
                    width: 64,
                    height: 64,
                  }}
                />
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 16,
                    lineHeight: 24,
                    fontFamily: font.pretendardRegular,
                    color: color.gray50,
                  }}>{`이번 시즌 크러셔 클럽\n참석 기록을 확인할 수 있어요`}</Text>
              </View>
            }
          />
        </View>
      </SectionContainer>
    </ScrollView>
  );
}
