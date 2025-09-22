import {ScreenLayout} from '@/components/ScreenLayout';
import useAppComponents from '@/hooks/useAppComponents';
import Logger from '@/logging/Logger';
import {ScreenProps} from '@/navigation/Navigation.screens';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import React, {useEffect, useState} from 'react';
import MenuTabs, {Tab} from './components/MenuTabs';
import WelcomeModal from './components/WelcomeModal';
import CurrentSeasonView from './views/CurrentSeasonView';
import HistoryView from './views/HistoryView';

export interface CrusherActivityScreenParams {
  qr?: string;
}

const QR_CODE = '2025-autumn';

export default function CrusherActivityScreen({
  route,
}: ScreenProps<'CrusherActivity'>) {
  const params = route.params;
  const {api} = useAppComponents();
  const queryClient = useQueryClient();

  const [visibleWelcomeModal, setVisibleWelcomeModal] = useState(false);

  async function recordStartingDate() {
    try {
      await api.recordCrusherClubActivityPost({
        questType: 'STARTING_DAY',
      });
      queryClient.invalidateQueries({
        queryKey: ['CurrentCrusherActivity'],
      });
    } catch (error: any) {
      Logger.logError(error);
    }
  }

  useEffect(() => {
    if (params.qr === QR_CODE) {
      setVisibleWelcomeModal(true);
      recordStartingDate();
    }
  }, [params.qr]);

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

      <WelcomeModal visible={visibleWelcomeModal} />
    </ScreenLayout>
  );
}
