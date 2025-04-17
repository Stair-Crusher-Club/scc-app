import {atom} from 'jotai';

export const currentLocationAtom = atom<{
  latitude: number;
  longitude: number;
} | null>(null);
