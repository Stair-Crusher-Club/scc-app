import {ScreenLayout} from '@/components/ScreenLayout';
import TabBar from '@/components/TabBar';
import useAppComponents from '@/hooks/useAppComponents';
import Logger from '@/logging/Logger';
import {ScreenProps} from '@/navigation/Navigation.screens';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import React, {useEffect, useState} from 'react';
import ClubQuestCheckInCompleteModal from './components/ClubQuestCheckInCompleteModal';
import WelcomeModal from './components/WelcomeModal';
import {tabItems} from './constants';
import {CrusherActivityTab} from './types';
import CurrentSeasonView from './views/CurrentSeasonView';
import HistoryView from './views/HistoryView';

export interface CrusherActivityScreenParams {
  qr?: string; // deprecated; please use questTypeToRecordActivity
  questTypeToRecordActivity?: string; // Can be CrusherClubQuestTypeDto enum or hardcoded activity ID like 'impactSession'
  clubQuestIdToCheckIn?: string;
}

const QR_CODE = '2025-autumn'; // qr is deprecated

export default function CrusherActivityScreen({
  route,
}: ScreenProps<'CrusherActivity'>) {
  const params = route.params;
  const {api} = useAppComponents();
  const queryClient = useQueryClient();

  const [visibleCheckInCompleteModal, setVisibleCheckInCompleteModal] =
    useState(false);

  async function recordCrusherClubActivity(questTypeOrActivityId: string) {
    try {
      await api.recordCrusherClubActivityPost({
        questTypeOrActivityId,
      });
      // 진행 중인 쿼리를 취소하고 새로운 fetch를 실행하여 race condition 방지
      await queryClient.cancelQueries({
        queryKey: ['CrusherActivityPageData'],
      });
      await queryClient.fetchQuery({
        queryKey: ['CrusherActivityPageData'],
        queryFn: async () => (await api.getCrusherActivityPageDataPost()).data,
      });
    } catch (error: any) {
      Logger.logError(error);
    }
  }

  useEffect(() => {
    // 하위호환을 위해 qr을 남겨둔다.
    if (params?.qr === QR_CODE) {
      recordCrusherClubActivity('STARTING_DAY');
    }
  }, [params?.qr]);

  useEffect(() => {
    if (params?.questTypeToRecordActivity) {
      recordCrusherClubActivity(params.questTypeToRecordActivity);
    }
  }, [params?.questTypeToRecordActivity]);

  async function checkInToClubQuest() {
    if (!params?.clubQuestIdToCheckIn) {
      return;
    }

    try {
      await api.checkInToClubQuestPost({
        clubQuestId: params.clubQuestIdToCheckIn,
      });
      // 진행 중인 쿼리를 취소하고 새로운 fetch를 실행하여 race condition 방지
      await queryClient.cancelQueries({
        queryKey: ['CrusherActivityPageData'],
      });
      await queryClient.fetchQuery({
        queryKey: ['CrusherActivityPageData'],
        queryFn: async () => (await api.getCrusherActivityPageDataPost()).data,
      });
      setVisibleCheckInCompleteModal(true);
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

      <WelcomeModal
        questTypeToRecordActivity={
          params?.qr === QR_CODE
            ? 'STARTING_DAY'
            : params?.questTypeToRecordActivity
        }
        // questTypeToRecordActivity={'impactSession'}
      />
      <ClubQuestCheckInCompleteModal
        visible={visibleCheckInCompleteModal}
        onClose={() => setVisibleCheckInCompleteModal(false)}
      />
    </ScreenLayout>
  );
}
