import {ScreenLayout} from '@/components/ScreenLayout';
import TabBar from '@/components/TabBar';
import {useState} from 'react';
import AchievementsSection from '../ConquererHistoryScreen/sections/AchievementsSection';
import {tabItems} from '../ReviewScreen/constants';
import {ReviewHistoryTab} from '../ReviewScreen/types';

export default function ReviewHistoryScreen() {
  const [currentTab, setCurrentTab] = useState<ReviewHistoryTab>('place');

  return (
    <ScreenLayout isHeaderVisible={true}>
      <TabBar items={tabItems} current={currentTab} onChange={setCurrentTab} />
      <AchievementsSection type="review" totalNumberOfPlaces={0} />
      {/* TODO: render items */}
    </ScreenLayout>
  );
}
