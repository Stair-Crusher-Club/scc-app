import {atom} from 'recoil';

export const currentLocationAtom = atom<{
  latitude: number;
  longitude: number;
} | null>({
  key: 'currentLocationAtom',
  default: null,
});
