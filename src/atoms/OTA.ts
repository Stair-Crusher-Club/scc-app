import {atom, selector} from 'recoil';

export enum OTACheckStatus {
  WILL_CHECK,
  NEED_TO_SYNC,
  INSTALLED,
}

export const otaCheckStatusAtom = atom<OTACheckStatus>({
  key: 'otaCheckStatusAtom',
  default: OTACheckStatus.WILL_CHECK,
});

export const isOTAPushInstalledState = selector({
  key: 'isOTAPushInstalledState',
  get: ({get}) => {
    const otaCheckStatus = get(otaCheckStatusAtom);
    return otaCheckStatus === OTACheckStatus.INSTALLED;
  },
});
