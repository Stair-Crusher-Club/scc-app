import {ScreenLayout} from '@/components/ScreenLayout';
import TabBar from '@/components/TabBar';
import {useState} from 'react';
import {tabItems} from './constants';
import {ConquererUpvoteTab} from './types';

export default function ConquererUpvoteScreen() {
  const [currentTab, setCurrentTab] = useState<ConquererUpvoteTab>('place');

  return (
    <ScreenLayout isHeaderVisible={true}>
      <TabBar items={tabItems} current={currentTab} onChange={setCurrentTab} />
      {/* TODO: render items */}
    </ScreenLayout>
  );
}
