import {describe, expect, it} from '@jest/globals';

import {buildChallengeMapRoutes} from '@/screens/HomeScreenV2/sections/challengeMapRoutes';

describe('buildChallengeMapRoutes', () => {
  it('현재 화면 위에 챌린지 상세 → 남은 매장 보기 순으로 쌓는다', () => {
    const routes = buildChallengeMapRoutes([{name: 'Main'}], 0, 'ch-1');

    expect(routes.map(r => r.name)).toEqual([
      'Main',
      'ChallengeDetail',
      'ChallengeConquerTargetPlaces',
    ]);
    expect(routes[1].params).toEqual({challengeId: 'ch-1'});
    expect(routes[2].params).toEqual({
      challengeId: 'ch-1',
      initialViewMode: 'map',
    });
  });

  it('현재 index 뒤쪽 라우트는 버린다', () => {
    const routes = buildChallengeMapRoutes(
      [{name: 'Main'}, {name: 'Setting'}, {name: 'ProfileEditor'}],
      1,
      'ch-2',
    );

    expect(routes.map(r => r.name)).toEqual([
      'Main',
      'Setting',
      'ChallengeDetail',
      'ChallengeConquerTargetPlaces',
    ]);
  });

  it('원본 배열을 수정하지 않는다', () => {
    const original = [{name: 'Main'}];

    buildChallengeMapRoutes(original, 0, 'ch-3');

    expect(original).toEqual([{name: 'Main'}]);
  });
});
