import {useQuery} from '@tanstack/react-query';
import React from 'react';

import {useMe} from '@/atoms/Auth';
import ActivityReportSummary from '@/components/ActivityReportSummary';
import useAppComponents from '@/hooks/useAppComponents';

export default function ConquererSummarySection() {
  const {api} = useAppComponents();
  const {userInfo} = useMe();
  const {data} = useQuery({
    queryKey: ['ConquererActivity'],
    queryFn: async () => (await api.getAccessibilityActivityReportPost()).data,
  });

  return (
    <ActivityReportSummary
      type="conquer"
      nickname={userInfo?.nickname}
      todayCount={data?.todayConqueredCount ?? 0}
      monthCount={data?.thisMonthConqueredCount ?? 0}
    />
  );
}
