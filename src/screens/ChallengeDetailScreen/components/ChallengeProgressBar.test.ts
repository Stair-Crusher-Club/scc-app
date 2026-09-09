import {describe, expect, it} from '@jest/globals';

import {getChallengeProgressFillPercent} from './ChallengeProgressBar';

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
