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
      // invalidateQueries()는 한 번 query에 등록된 이후에만 동작한다.
      // checkInToClubQuestPost()가 첫 getCrusherActivityPageDataPost() 호출 전에 끝나는 경우, invalidateQueries()는 refetch를 트리거하지 않는다.
      // 이러면 오래된 데이터가 보일 수 있다.
      // 따라서 강제로 refetch를 하도록 refetchQueries()를 사용한다.
      await queryClient.refetchQueries({
        queryKey: ['CrusherActivityPageData'],
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
      // invalidateQueries()는 한 번 query에 등록된 이후에만 동작한다.
      // checkInToClubQuestPost()가 첫 getCrusherActivityPageDataPost() 호출 전에 끝나는 경우, invalidateQueries()는 refetch를 트리거하지 않는다.
      // 이러면 오래된 데이터가 보일 수 있다.
      // 따라서 강제로 refetch를 하도록 refetchQueries()를 사용한다.
      await queryClient.refetchQueries({
        queryKey: ['CrusherActivityPageData'],
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
    queryKey: ['CrusherActivityPageData'],
    queryFn: async () => (await api.getCrusherActivityPageDataPost()).data,
    staleTime: 1000 * 5,
  });

  const crewType = data?.currentCrusherActivity?.crusherClub.crewType;
  const crusherActivityHistories = data?.crusherActivityHistories;

  const [currentTab, setCurrentTab] = useState<CrusherActivityTab>('current');

  useEffect(() => {
    setCurrentTab(crewType ? 'current' : 'history');
  }, [crewType]);

  function renderView() {
    switch (currentTab) {
      case 'current':
        return <CurrentSeasonView />;
      case 'history':
        return (
          <HistoryView
            crusherActivityHistories={crusherActivityHistories}
            isCurrentCrew={!!crewType}
          />
        );
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
