import {describe, expect, it} from '@jest/globals';

import {EpochMillisTimestamp} from '@/generated-sources/openapi';

import {ChallengeDateFormat} from './ChallengeDateFormat';

function epochOf(
  year: number,
  month: number,
  day: number,
): EpochMillisTimestamp {
  return {value: new Date(year, month - 1, day).getTime()};
}

describe('formatChallengeDetailPeriod', () => {
  it('시작·종료 연도가 같으면 종료 연도를 생략한다', () => {
    expect(
      ChallengeDateFormat.formatChallengeDetailPeriod(
        epochOf(2026, 9, 15),
        epochOf(2026, 12, 31),
      ),
    ).toBe('26.09.15 ~ 12.31');
  });

  it('시작·종료 연도가 다르면 양쪽 다 표기한다', () => {
    expect(
      ChallengeDateFormat.formatChallengeDetailPeriod(
        epochOf(2026, 9, 15),
        epochOf(2027, 1, 31),
      ),
    ).toBe('26.09.15 ~ 27.01.31');
  });

  it('endsAt 이 없으면 시작일만 표기한다', () => {
    expect(
      ChallengeDateFormat.formatChallengeDetailPeriod(epochOf(2026, 9, 15)),
    ).toBe('26.09.15 ~');
  });

  it('endsAt 이 null 이어도 시작일만 표기한다', () => {
    expect(
      ChallengeDateFormat.formatChallengeDetailPeriod(
        epochOf(2026, 9, 15),
        null,
      ),
    ).toBe('26.09.15 ~');
  });
});
