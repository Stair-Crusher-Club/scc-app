import {describe, expect, it} from '@jest/globals';

import {
  getChallengeProgressFillPercent,
  getChallengeProgressTicks,
  getTickPositionStyle,
} from './ChallengeProgressBar';

describe('getChallengeProgressFillPercent', () => {
  it('goal=0(ctpl 비어있음) 이면 0 나눗셈 없이 0% 를 반환한다', () => {
    expect(getChallengeProgressFillPercent(0, 0)).toBe(0);
    expect(getChallengeProgressFillPercent(5, 0)).toBe(0);
  });

  it('정복수 0 이면 0% 를 반환한다', () => {
    expect(getChallengeProgressFillPercent(0, 240)).toBe(0);
  });

  it('중간값이면 비율대로 계산한다', () => {
    expect(getChallengeProgressFillPercent(60, 240)).toBe(25);
  });

  it('정복수 === goal 이면 100% 를 반환한다', () => {
    expect(getChallengeProgressFillPercent(240, 240)).toBe(100);
  });

  it('정복수 > goal 이면 100% 로 클램프한다', () => {
    expect(getChallengeProgressFillPercent(300, 240)).toBe(100);
  });
});

describe('getChallengeProgressTicks', () => {
  it('milestones가 있으면 milestone/goal 비율로 눈금을 만든다 (SKI Road Maker 사례)', () => {
    const ticks = getChallengeProgressTicks([1000, 3000, 5000], 10000);
    expect(ticks.map(t => t.label)).toEqual(['0', '10%', '30%', '50%', '100%']);
    expect(ticks.map(t => t.percent)).toEqual([0, 10, 30, 50, 100]);
    // 3개뿐이라 전부 표시되어야 한다 (간격 10/20/20/50 모두 임계값 이상)
    expect(ticks.every(t => t.showLabel)).toBe(true);
  });

  it('milestones가 비어있으면 25/50/75% 고정 눈금으로 폴백한다', () => {
    const ticks = getChallengeProgressTicks([], 240);
    expect(ticks.map(t => t.label)).toEqual(['0', '25%', '50%', '75%', '100%']);
    expect(ticks.every(t => t.showLabel)).toBe(true);
  });

  it('milestones가 undefined/null이어도 폴백한다', () => {
    expect(getChallengeProgressTicks(undefined, 240).map(t => t.label)).toEqual(
      ['0', '25%', '50%', '75%', '100%'],
    );
    expect(getChallengeProgressTicks(null, 240).map(t => t.label)).toEqual([
      '0',
      '25%',
      '50%',
      '75%',
      '100%',
    ]);
  });

  it('goal=0 이면 0 나눗셈 없이 25/50/75% 로 폴백한다', () => {
    const ticks = getChallengeProgressTicks([100, 200], 0);
    expect(ticks.map(t => t.label)).toEqual(['0', '25%', '50%', '75%', '100%']);
  });

  it('milestone이 goal을 초과하면 100%로 클램프되어 경계 눈금에 흡수된다', () => {
    const ticks = getChallengeProgressTicks([15000], 10000);
    expect(ticks.map(t => t.label)).toEqual(['0', '100%']);
    expect(ticks.map(t => t.percent)).toEqual([0, 100]);
  });

  it('중복/비정렬 마일스톤도 정렬 + 중복 제거되어 깨지지 않는다', () => {
    const ticks = getChallengeProgressTicks([3000, 1000, 1000], 10000);
    expect(ticks.map(t => t.label)).toEqual(['0', '10%', '30%', '100%']);
  });

  it('마일스톤이 많고 간격이 좁으면(5개 이상) 겹치는 라벨은 생략하되 dot은 전부 유지한다', () => {
    // 3%p 간격 10개 — 임계값(6%p)보다 좁아 절반 정도만 라벨이 보여야 한다
    const milestones = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30];
    const ticks = getChallengeProgressTicks(milestones, 100);
    // dot(전체 눈금)은 0, 10개, 100 = 12개 전부 유지
    expect(ticks).toHaveLength(12);
    // 라벨은 일부 생략되어야 한다
    const shown = ticks.filter(t => t.showLabel);
    expect(shown.length).toBeLessThan(ticks.length);
    // 첫 눈금(0)과 마지막 눈금(100%)은 항상 라벨을 보여준다
    expect(ticks[0].showLabel).toBe(true);
    expect(ticks[ticks.length - 1].showLabel).toBe(true);
    // 보여지는 라벨끼리는 항상 임계값(6%p) 이상 떨어져 있다
    for (let i = 1; i < shown.length; i++) {
      expect(shown[i].percent - shown[i - 1].percent).toBeGreaterThanOrEqual(6);
    }
  });
});

describe('getTickPositionStyle', () => {
  it('0% 눈금은 트랙 왼쪽 끝에 딱 붙여 밖으로 삐져나오지 않게 한다', () => {
    expect(getTickPositionStyle(0, -4)).toEqual({left: 0});
  });

  it('100% 눈금은 트랙 오른쪽 끝에 딱 붙인다', () => {
    expect(getTickPositionStyle(100, -4)).toEqual({right: 0});
  });

  it('중간 눈금은 percent 위치에서 middleOffset 만큼 중앙정렬한다', () => {
    expect(getTickPositionStyle(30, -4)).toEqual({
      left: '30%',
      marginLeft: -4,
    });
    // 라벨용 오프셋(-14)도 동일한 규칙을 따른다
    expect(getTickPositionStyle(30, -14)).toEqual({
      left: '30%',
      marginLeft: -14,
    });
  });
});
