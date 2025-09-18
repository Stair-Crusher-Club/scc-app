import {ScreenLayout} from '@/components/ScreenLayout';
import TabBar from '@/components/TabBar';
import {UpvoteTargetTypeDto} from '@/generated-sources/openapi';
import {useState} from 'react';
import {tabItems} from './constants';

export default function ConquererUpvoteScreen() {
  const [currentTab, setCurrentTab] = useState<UpvoteTargetTypeDto>(
    'PLACE_ACCESSIBILITY',
  );

  return (
    <ScreenLayout isHeaderVisible={true}>
      <TabBar items={tabItems} current={currentTab} onChange={setCurrentTab} />
      {/* TODO: render items */}
    </ScreenLayout>
  );
}
