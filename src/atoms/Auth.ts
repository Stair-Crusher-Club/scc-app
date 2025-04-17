import {atom} from 'jotai';

import {atomForLocal} from '@/atoms/atomForLocal';
import {User} from '@/generated-sources/openapi';

export const userInfoAtom = atomForLocal<User>('userInfo');

export const accessTokenAtom = atomForLocal<string>('scc-token');

export const featureFlagAtom = atom<{
  isMapVisible: boolean;
  isToiletVisible: boolean;
} | null>(null);
