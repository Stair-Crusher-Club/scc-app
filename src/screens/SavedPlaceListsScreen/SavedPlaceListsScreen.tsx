import React, {useState} from 'react';
import styled from 'styled-components/native';

import {ScreenLayout} from '@/components/ScreenLayout';
import V2TabBar from '@/screens/PlaceDetailV2Screen/components/V2TabBar';

import SavedContentsTab from './components/SavedContentsTab';
import SavedPlaceListsTab from './components/SavedPlaceListsTab';

type SavedTabKey = 'PLACES' | 'CONTENTS';

const TAB_ITEMS: Array<{value: SavedTabKey; label: string}> = [
  {value: 'PLACES', label: '저장한 장소'},
  {value: 'CONTENTS', label: '저장한 컨텐츠'},
];

export default function SavedPlaceListsScreen() {
  const [currentTab, setCurrentTab] = useState<SavedTabKey>('PLACES');

  return (
    <ScreenLayout isHeaderVisible={true}>
      <V2TabBar<SavedTabKey>
        items={TAB_ITEMS}
        current={currentTab}
        onChange={setCurrentTab}
      />
      <TabContent>
        {currentTab === 'PLACES' ? (
          <SavedPlaceListsTab />
        ) : (
          <SavedContentsTab />
        )}
      </TabContent>
    </ScreenLayout>
  );
}

const TabContent = styled.View`
  flex: 1;
`;
