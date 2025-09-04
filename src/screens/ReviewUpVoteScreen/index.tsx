import {ScreenLayout} from '@/components/ScreenLayout';
import TabBar from '@/components/TabBar';
import {useState} from 'react';
import {tabItems} from '../ReviewScreen/constants';
import {ReviewHistoryTab} from '../ReviewScreen/types';

export default function ReviewUpVoteScreen() {
  const [currentTab, setCurrentTab] = useState<ReviewHistoryTab>('place');

  return (
    <ScreenLayout isHeaderVisible={true}>
      <TabBar items={tabItems} current={currentTab} onChange={setCurrentTab} />
      {/* TODO: render items */}
    </ScreenLayout>
  );
}
