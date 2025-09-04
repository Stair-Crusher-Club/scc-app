import {ScreenLayout} from '@/components/ScreenLayout';

import HistorySection from './sections/HistorySection';
import SummarySection from './sections/SummarySection';

export default function ReviewScreen() {
  return (
    <ScreenLayout isHeaderVisible={true}>
      <SummarySection />
      <HistorySection />
    </ScreenLayout>
  );
}
