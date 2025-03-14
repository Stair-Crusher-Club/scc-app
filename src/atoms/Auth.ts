import {atom} from 'recoil';

import {atomForLocal} from '@/atoms/atomForLocal';
import {User} from '@/generated-sources/openapi';

export const userInfoAtom = atomForLocal<User | null>('userInfo');

export const accessTokenAtom = atomForLocal<string | null>('scc-token');

export const featureFlagAtom = atom<{
  isMapVisible: boolean;
  isToiletVisible: boolean;
} | null>({
  key: 'featureFlagAtom',
  default: null,
});
