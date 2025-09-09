import {useMe} from '@/atoms/Auth';
import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {FlashList} from '@shopify/flash-list';
import {useState} from 'react';
import {Image, ScrollView, Text, View} from 'react-native';
import ActivityItem from '../components/ActivityItem';
import ExpandToggleButton, {
  ExpandToggleButtonStatus,
} from '../components/ExpandToggleButton';
import QuestItem from '../components/QuestItem';
import SectionContainer from '../components/SectionContainer';
import {crewInfoAssets, CrewRole} from '../constants';

const _activities = Array(0).fill(0);

export default function CurrentSeasonView() {
  const {userInfo} = useMe();
  const [questToggleStatus, setQuestToggleStatus] =
    useState<ExpandToggleButtonStatus>('expand');
  const crewRole: CrewRole = 'conqueror';

  const [quests, setQuests] = useState(
    questToggleStatus === 'collapse'
      ? crewInfoAssets[crewRole].quests.slice(0, 6)
      : crewInfoAssets[crewRole].quests,
  );

  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 60,
        gap: 28,
      }}>
      <SectionContainer title="25’ 가을 시즌">
        <View
          style={{
            borderWidth: 1,
            borderColor: '#F2F2F5',
            padding: 12,
            borderRadius: 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <View style={{gap: 2}}>
            <Text
              style={{
                fontSize: 12,
                fontFamily: font.pretendardBold,
                color: color.brand50,
                lineHeight: 16,
              }}>
              {crewInfoAssets[crewRole].label} 크루
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
            source={crewInfoAssets[crewRole].source}
            style={{
              width: 66,
              height: 48,
            }}
          />
        </View>
      </SectionContainer>

      <SectionContainer title="나의 퀘스트">
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
            renderItem={({item, index}) => (
              <QuestItem
                title={item.title}
                date={`09.0${index + 1}`}
                source={item.source.empty}
              />
            )}
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
                if (questToggleStatus === 'collapse') {
                  setQuestToggleStatus('expand');
                  setQuests(crewInfoAssets[crewRole].quests);
                } else {
                  setQuestToggleStatus('collapse');
                  setQuests(crewInfoAssets[crewRole].quests.slice(0, 6));
                }
              }}
            />
          </View>
        </View>
      </SectionContainer>

      <SectionContainer
        title="나의 참여"
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
              {'clear'}
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
              {'total'}
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
          {_activities && _activities.length > 0 && (
            <View
              style={{
                position: 'absolute',
                left: 16,
                top: 28,
                bottom: 0,
                width: 2,
                backgroundColor: color.gray25,
              }}
            />
          )}
          <FlashList
            data={_activities}
            renderItem={() => (
              <ActivityItem date="09.13" title="스타딩데이 참여" />
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
