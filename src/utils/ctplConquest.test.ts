import {describe, expect, it} from '@jest/globals';

import {
  ChallengeDto,
  ChallengeStatusDto,
  ContributedChallengeInfoDto,
} from '@/generated-sources/openapi';

import {getCtplConquest} from './ctplConquest';

function challengeOf(overrides: Partial<ChallengeDto>): ChallengeDto {
  return {
    id: 'challenge-default',
    name: '기본 챌린지',
    status: ChallengeStatusDto.InProgress,
    isPublic: true,
    isComplete: false,
    startsAt: {value: 0},
    goal: 100,
    milestones: [],
    participationsCount: 0,
    contributionsCount: 0,
    description: '',
    isB2B: false,
    hasConquerTargetPlaceList: false,
    ...overrides,
  };
}

function infoOf(
  challengeOverrides: Partial<ChallengeDto>,
): ContributedChallengeInfoDto {
  return {
    challenge: challengeOf(challengeOverrides),
    completedQuestsByContribution: [],
  };
}

describe('getCtplConquest', () => {
  it('CTPL 이 없으면 undefined 를 반환한다', () => {
    const infos = [infoOf({id: 'c1', hasConquerTargetPlaceList: false})];
    expect(getCtplConquest(infos)).toBeUndefined();
  });

  it('infos 자체가 undefined 여도 undefined 를 반환한다', () => {
    expect(getCtplConquest(undefined)).toBeUndefined();
  });

  it('CTPL 이 있으면 challengeId/brandName/order/total 을 뽑는다', () => {
    const infos = [
      infoOf({
        id: 'c1',
        contributionsCount: 3,
        goal: 240,
        hasConquerTargetPlaceList: true,
        conquerTargetPlaceList: {id: 'ctpl-1', displayName: '올리브영'},
      }),
    ];
    expect(getCtplConquest(infos)).toEqual({
      challengeId: 'c1',
      brandName: '올리브영',
      order: 3,
      total: 240,
    });
  });

  it('여러 챌린지 중 CTPL 이 연결된 것만 고른다', () => {
    const infos = [
      infoOf({id: 'c1', hasConquerTargetPlaceList: false}),
      infoOf({
        id: 'c2',
        contributionsCount: 7,
        goal: 50,
        hasConquerTargetPlaceList: true,
        conquerTargetPlaceList: {id: 'ctpl-2', displayName: '다이소'},
      }),
      infoOf({id: 'c3', hasConquerTargetPlaceList: false}),
    ];
    expect(getCtplConquest(infos)).toEqual({
      challengeId: 'c2',
      brandName: '다이소',
      order: 7,
      total: 50,
    });
  });
});
