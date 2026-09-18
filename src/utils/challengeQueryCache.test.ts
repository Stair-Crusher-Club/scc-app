import {QueryClient} from '@tanstack/react-query';
import {describe, expect, it} from '@jest/globals';

import {invalidateChallengeQueries} from '@/utils/challengeQueryCache';

describe('invalidateChallengeQueries', () => {
  it('챌린지 관련 캐시만 무효화한다 (실제 키 모양으로 prefix 매칭 확인)', () => {
    const qc = new QueryClient();
    const ctplKey = [
      'ChallengeConquerTargetPlaces',
      'ch-1',
      {sortOption: 'distance', isRegistered: false},
    ];
    const detailKey = ['ChallengeDetail', 'ch-1'];
    const homeKey = ['HomeScreenData', '37.5,127.0'];
    const unrelatedKey = ['PlaceDetailV2', 'place-1'];
    for (const key of [ctplKey, detailKey, homeKey, unrelatedKey]) {
      qc.setQueryData(key, {});
    }

    invalidateChallengeQueries(qc);

    expect(qc.getQueryState(ctplKey)?.isInvalidated).toBe(true);
    expect(qc.getQueryState(detailKey)?.isInvalidated).toBe(true);
    expect(qc.getQueryState(homeKey)?.isInvalidated).toBe(true);
    expect(qc.getQueryState(unrelatedKey)?.isInvalidated).toBe(false);
  });
});
