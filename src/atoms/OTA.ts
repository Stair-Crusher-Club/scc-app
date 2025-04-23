import {atom} from 'jotai';

export enum OTACheckStatus {
  WILL_CHECK,
  NEED_TO_SYNC,
  INSTALLED,
}

export const otaCheckStatusAtom = atom<OTACheckStatus>(
  OTACheckStatus.WILL_CHECK,
);

export const isOTAPushInstalledState = atom<boolean>(get => {
  const otaCheckStatus = get(otaCheckStatusAtom);
  return otaCheckStatus === OTACheckStatus.INSTALLED;
});
