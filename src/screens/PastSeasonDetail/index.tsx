import {ScreenLayout} from '@/components/ScreenLayout';
import type {ScreenProps} from '@/navigation/Navigation.screens';
import React from 'react';
import CrusherActivitySeasonView from '../CrusherActivity/views/CrusherActivitySeasonView';

export interface PastSeasonDetailScreenParams {
  crusherClubId: string;
  title: string;
}

export default function PastSeasonDetailScreen({
  route,
}: ScreenProps<'PastSeasonDetail'>) {
  const {crusherClubId, title} = route.params;

  return (
    <ScreenLayout isHeaderVisible>
      <CrusherActivitySeasonView crusherClubId={crusherClubId} title={title} />
    </ScreenLayout>
  );
}
