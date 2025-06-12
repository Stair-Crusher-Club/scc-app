import {CoachMarkProvider} from '@/screens/HomeScreen/contexts/CoachMarkContext';

import Screen from './HomeScreen';

export type {HomeScreenParams} from './HomeScreen';

export default function HomeScreen() {
  return (
    <CoachMarkProvider>
      <Screen />
    </CoachMarkProvider>
  );
}
