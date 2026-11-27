import {describe, expect, it} from '@jest/globals';

import type {
  AccessibilityInfoV2Dto,
  BuildingAccessibility,
  ChallengeCrusherGroupDto,
  PlaceAccessibility,
} from '@/generated-sources/openapi';

import {
  formatConquerorText,
  getLatestChallengeCrusherGroup,
} from './conquerorDisplay';

const group = (name: string): ChallengeCrusherGroupDto =>
  ({name}) as ChallengeCrusherGroupDto;

function pa(
  id: string,
  createdAt: number,
  registeredUserName?: string,
  challengeCrusherGroup?: ChallengeCrusherGroupDto,
): PlaceAccessibility {
  return {
    id,
    createdAt: {value: createdAt},
    registeredUserName,
    challengeCrusherGroup,
  } as PlaceAccessibility;
}

function ba(
  id: string,
  createdAt: number,
  registeredUserName?: string,
  challengeCrusherGroup?: ChallengeCrusherGroupDto,
): BuildingAccessibility {
  return {
    id,
    createdAt: {value: createdAt},
    registeredUserName,
    challengeCrusherGroup,
  } as BuildingAccessibility;
}

function info(
  placeAccessibilities: PlaceAccessibility[],
  buildingAccessibilities: BuildingAccessibility[] = [],
): AccessibilityInfoV2Dto {
  return {
    placeAccessibilities,
    buildingAccessibilities,
  } as AccessibilityInfoV2Dto;
}

describe('formatConquerorText', () => {
  it('서버 순서(접근 레벨순)와 무관하게 가장 최근 장소 등록자를 앞에 둔다', () => {
    // 서버는 접근 레벨 좋은 순으로 내려준다 → 옛 등록이 앞에 올 수 있다
    const a = info([pa('old', 100, '먼저등록'), pa('new', 200, '나중등록')]);
    expect(formatConquerorText(a)).toBe('정복자 나중등록 외 1명');
  });

  it('최신 등록이 익명이면 그다음 최근 실명 등록자를 보여준다', () => {
    const a = info([
      pa('p1', 100, '가장옛날'),
      pa('p2', 300),
      pa('p3', 200, '두번째최근'),
    ]);
    expect(formatConquerorText(a)).toBe('정복자 두번째최근 외 1명');
  });

  it('건물 등록이 더 최근이어도 장소 등록자가 기준이다', () => {
    const a = info(
      [pa('p1', 100, '장소등록자')],
      [ba('b1', 999, '건물등록자')],
    );
    expect(formatConquerorText(a)).toBe('정복자 장소등록자 외 1명');
  });

  it('장소 실명 등록자가 없으면 최근 건물 등록자를 보여준다', () => {
    const a = info(
      [pa('p1', 100)],
      [ba('b1', 100, '옛건물'), ba('b2', 200, '새건물')],
    );
    expect(formatConquerorText(a)).toBe('정복자 새건물 외 1명');
  });

  it('같은 사람의 중복 등록은 한 명으로 센다', () => {
    const a = info([pa('p1', 100, '홍길동'), pa('p2', 200, '홍길동')]);
    expect(formatConquerorText(a)).toBe('정복자 홍길동');
  });

  it('실명 등록자가 없으면 익명 비밀요원', () => {
    expect(formatConquerorText(info([pa('p1', 100)]))).toBe(
      '정복자 익명 비밀요원',
    );
    expect(formatConquerorText(undefined)).toBe('정복자 익명 비밀요원');
  });

  it('배열이 비어 있으면 단일 필드로 fallback 한다', () => {
    const a = {
      placeAccessibilities: [],
      placeAccessibility: pa('p1', 100, '단일'),
    } as unknown as AccessibilityInfoV2Dto;
    expect(formatConquerorText(a)).toBe('정복자 단일');
  });
});

describe('getLatestChallengeCrusherGroup', () => {
  it('챌린지 그룹이 붙은 장소 등록 중 가장 최근 것을 고른다', () => {
    const a = info([
      pa('p1', 100, 'A', group('옛그룹')),
      pa('p2', 300, 'B'),
      pa('p3', 200, 'C', group('새그룹')),
    ]);
    expect(getLatestChallengeCrusherGroup(a)?.name).toBe('새그룹');
  });

  it('장소 등록에 그룹이 없으면 건물 등록 중 가장 최근 그룹', () => {
    const a = info(
      [pa('p1', 100, 'A')],
      [
        ba('b1', 100, 'X', group('건물옛')),
        ba('b2', 200, 'Y', group('건물새')),
      ],
    );
    expect(getLatestChallengeCrusherGroup(a)?.name).toBe('건물새');
  });

  it('그룹이 하나도 없으면 undefined', () => {
    expect(getLatestChallengeCrusherGroup(info([pa('p1', 1)]))).toBeUndefined();
  });
});
