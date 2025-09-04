import {ScreenLayout} from '@/components/ScreenLayout';
import {useState} from 'react';
import MenuTabs, {Tab} from './components/MenuTabs';
import CurrentSeasonView from './views/CurrentSeasonView';
import HistoryView from './views/HistoryView';

export default function CrusherHistoryScreen() {
  const [currentTab, setCurrentTab] = useState<Tab>('current');

  function renderView() {
    switch (currentTab) {
      case 'current':
        return <CurrentSeasonView />;
      case 'history':
        return <HistoryView />;
    }
  }

  return (
    <ScreenLayout isHeaderVisible={true}>
      <MenuTabs currentTab={currentTab} setCurrentTab={setCurrentTab} />
      {renderView()}
    </ScreenLayout>
  );
}

/**
 * * 시즌명
 * 사용자 role : 이거에 따라 이미지도 변경되어야 함
 * 닉네임 > 이미 갖고 있는 값만 보여주면 됨
 */

/**
 * * 나의 퀘스트
 * 배경 이미지는 고정
 * 도장 이미지 서버에서 타입 받아와서 보여주기? > 변경될 수 있으므로
 * 제목
 * 뱃지 획득 날짜
 */

/**
 * * 나의 참여
 * 날짜 / 제목
 */
