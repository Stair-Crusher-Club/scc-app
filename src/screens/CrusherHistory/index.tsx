import {ScreenLayout} from '@/components/ScreenLayout';
import useAppComponents from '@/hooks/useAppComponents';
import {useQuery} from '@tanstack/react-query';
import {useEffect, useState} from 'react';
import MenuTabs, {Tab} from './components/MenuTabs';
import CurrentSeasonView from './views/CurrentSeasonView';
import HistoryView from './views/HistoryView';

export default function CrusherHistoryScreen() {
  const {api} = useAppComponents();

  const {data} = useQuery({
    queryKey: ['CurrentCrusherActivity'],
    queryFn: async () => (await api.getCurrentCrusherActivityPost()).data,
    staleTime: 1000 * 5,
  });

  const crewType = data?.currentCrusherActivity?.crusherClub.crewType;

  const [currentTab, setCurrentTab] = useState<Tab>('current');

  useEffect(() => {
    setCurrentTab(crewType ? 'current' : 'history');
  }, [crewType]);

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
      {/* TODO 리뷰 브랜치 머지 후 공통 컴포넌트 사용하기 */}
      {crewType && (
        <MenuTabs currentTab={currentTab} setCurrentTab={setCurrentTab} />
      )}
      {renderView()}
    </ScreenLayout>
  );
}
