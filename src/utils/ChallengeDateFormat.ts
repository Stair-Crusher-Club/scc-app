import {isNil} from 'lodash';

import {EpochMillisTimestamp} from '@/generated-sources/openapi';

export const ChallengeDateFormat = {
  formatChallengeDetailEndsAt(
    endsAt: EpochMillisTimestamp | undefined | null,
  ): string {
    if (isNil(endsAt)) {
      return '기한 없음';
    }
    const endsAtDate = new Date(endsAt?.value);
    return `~${endsAtDate.getFullYear()}.${
      endsAtDate.getMonth() + 1
    }.${endsAtDate.getDate()}`;
  },
  formatUpcomingBottomSheet(startsAt: EpochMillisTimestamp): string {
    const d = new Date(startsAt.value);
    return `${d.getFullYear()}년 ${
      d.getMonth() + 1
    }월 ${d.getDate()}일 ${d.getHours()}시 ${d.getMinutes()}분`;
  },
};
