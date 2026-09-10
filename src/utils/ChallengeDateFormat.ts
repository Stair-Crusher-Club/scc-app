import {isNil} from 'lodash';

import {EpochMillisTimestamp} from '@/generated-sources/openapi';

function formatYyMmDd(epochMillis: EpochMillisTimestamp) {
  const d = new Date(epochMillis.value);
  return {
    yy: String(d.getFullYear() % 100).padStart(2, '0'),
    mm: String(d.getMonth() + 1).padStart(2, '0'),
    dd: String(d.getDate()).padStart(2, '0'),
  };
}

export const ChallengeDateFormat = {
  formatUpcomingBottomSheet(startsAt: EpochMillisTimestamp): string {
    const d = new Date(startsAt.value);
    return `${d.getFullYear()}년 ${
      d.getMonth() + 1
    }월 ${d.getDate()}일 ${d.getHours()}시 ${d.getMinutes()}분`;
  },
  /** 챌린지 상세 메타 행의 기간 표기. 예: `26.09.15 ~ 12.31` (연도가 같으면 종료 연도 생략) */
  formatChallengeDetailPeriod(
    startsAt: EpochMillisTimestamp,
    endsAt?: EpochMillisTimestamp | null,
  ): string {
    const start = formatYyMmDd(startsAt);
    const startStr = `${start.yy}.${start.mm}.${start.dd}`;
    if (isNil(endsAt)) {
      return `${startStr} ~`;
    }
    const end = formatYyMmDd(endsAt);
    const endStr =
      start.yy === end.yy
        ? `${end.mm}.${end.dd}`
        : `${end.yy}.${end.mm}.${end.dd}`;
    return `${startStr} ~ ${endStr}`;
  },
};
