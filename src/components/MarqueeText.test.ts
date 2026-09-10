import {describe, expect, it} from '@jest/globals';

import {getMarqueeOverflow} from './MarqueeText';

describe('getMarqueeOverflow', () => {
  it('측정 전(폭 0)에는 애니메이션하지 않는다', () => {
    expect(getMarqueeOverflow(0, 0)).toBe(0);
    expect(getMarqueeOverflow(300, 0)).toBe(0);
    expect(getMarqueeOverflow(0, 200)).toBe(0);
  });

  it('컨테이너에 들어가면 0을 돌려준다', () => {
    expect(getMarqueeOverflow(120, 200)).toBe(0);
    expect(getMarqueeOverflow(200, 200)).toBe(0);
  });

  it('넘치는 만큼을 왕복 거리로 돌려준다', () => {
    expect(getMarqueeOverflow(320, 200)).toBe(120);
  });

  it('1px 미만 차이는 렌더 반올림 노이즈로 보고 무시한다', () => {
    // 이걸 0으로 안 만들면 넘치지 않는 텍스트가 미세하게 떠는 애니메이션이 된다
    expect(getMarqueeOverflow(200.4, 200)).toBe(0);
    expect(getMarqueeOverflow(201, 200)).toBe(1);
  });
});
