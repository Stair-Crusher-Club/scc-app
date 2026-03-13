import {useMe} from '@/atoms/Auth';
import ActivityReportSummary from '@/components/ActivityReportSummary';
import useAppComponents from '@/hooks/useAppComponents';
import {useQuery} from '@tanstack/react-query';
import React from 'react';

export default function SummarySection() {
  const {api} = useAppComponents();
  const {userInfo} = useMe();

  const {data} = useQuery({
    queryKey: ['ReviewReport'],
    queryFn: async () => {
      const response = await api.getReviewActivityReportPost();
      return response.data;
    },
  });

  return (
    <ActivityReportSummary
      type="review"
      nickname={userInfo?.nickname}
      todayCount={data?.todayReviewedCount ?? 0}
      monthCount={data?.thisMonthReviewedCount ?? 0}
    />
  );
}
