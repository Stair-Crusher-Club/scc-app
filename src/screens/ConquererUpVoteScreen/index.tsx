import {ScreenLayout} from '@/components/ScreenLayout';
import TabBar from '@/components/TabBar';
import {useState} from 'react';
import {tabItems} from './constants';
import {ConquererUpVoteTab} from './types';

export default function ConquererUpVoteScreen() {
  const [currentTab, setCurrentTab] = useState<ConquererUpVoteTab>('place');

  return (
    <ScreenLayout isHeaderVisible={true}>
      <TabBar items={tabItems} current={currentTab} onChange={setCurrentTab} />
      {/* TODO: render items */}
    </ScreenLayout>
  );
}
