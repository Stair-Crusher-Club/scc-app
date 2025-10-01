import {ScreenLayout} from '@/components/ScreenLayout';
import TabBar from '@/components/TabBar';
import useAppComponents from '@/hooks/useAppComponents';
import Logger from '@/logging/Logger';
import {ScreenProps} from '@/navigation/Navigation.screens';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import React, {useEffect, useState} from 'react';
import WelcomeModal from './components/WelcomeModal';
import {tabItems} from './constants';
import {CrusherActivityTab} from './types';
import CurrentSeasonView from './views/CurrentSeasonView';
import HistoryView from './views/HistoryView';

export interface CrusherActivityScreenParams {
  qr?: string;
  clubQuestIdToCheckIn?: string;
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
    if (params?.qr === QR_CODE) {
      setVisibleWelcomeModal(true);
      recordStartingDate();
    }
  }, [params?.qr]);

  async function checkInToClubQuest() {
    if (!params?.clubQuestIdToCheckIn) {
      return;
    }

    try {
      await api.checkInToClubQuestPost({
        clubQuestId: params.clubQuestIdToCheckIn,
      });
      queryClient.invalidateQueries({
        queryKey: ['CurrentCrusherActivity'],
      });
    } catch (error: any) {
      Logger.logError(error);
    }
  }

  useEffect(() => {
    if (params?.clubQuestIdToCheckIn) {
      checkInToClubQuest();
    }
  }, [params?.clubQuestIdToCheckIn]);

  const {data} = useQuery({
    queryKey: ['CurrentCrusherActivity'],
    queryFn: async () => (await api.getCurrentCrusherActivityPost()).data,
    staleTime: 1000 * 5,
  });

  const crewType = data?.currentCrusherActivity?.crusherClub.crewType;

  const [currentTab, setCurrentTab] = useState<CrusherActivityTab>('current');

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
      {crewType && (
        <TabBar
          items={tabItems}
          current={currentTab}
          onChange={setCurrentTab}
        />
      )}
      {renderView()}

      <WelcomeModal visible={visibleWelcomeModal} />
    </ScreenLayout>
  );
}
