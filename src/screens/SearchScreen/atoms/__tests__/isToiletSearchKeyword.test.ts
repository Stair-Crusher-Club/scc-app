import {describe, it, expect} from '@jest/globals';

import {isToiletSearchKeyword} from '@/screens/SearchScreen/atoms';

describe('isToiletSearchKeyword', () => {
  it.each(['화장실', '장애인화장실', '장애인 화장실', '장애인  화장실'])(
    '"%s" 는 화장실 검색으로 취급한다',
    keyword => {
      expect(isToiletSearchKeyword(keyword)).toBe(true);
    },
  );

  it.each(['카페', '', '화장실 근처', '공중화장실'])(
    '"%s" 는 화장실 검색이 아니다',
    keyword => {
      expect(isToiletSearchKeyword(keyword)).toBe(false);
    },
  );

  it('null/undefined 는 false', () => {
    expect(isToiletSearchKeyword(null)).toBe(false);
    expect(isToiletSearchKeyword(undefined)).toBe(false);
  });
});
