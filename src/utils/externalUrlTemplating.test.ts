import {describe, expect, it} from '@jest/globals';

import {
  isTemplatedExternalUrl,
  resolveTemplatedExternalUrl,
} from './externalUrlTemplating';

describe('isTemplatedExternalUrl', () => {
  it('forms.staircrusher.club 은 화이트리스트', () => {
    expect(isTemplatedExternalUrl('https://forms.staircrusher.club/x')).toBe(
      true,
    );
  });

  it('tally.so 는 화이트리스트', () => {
    expect(isTemplatedExternalUrl('https://tally.so/r/abc')).toBe(true);
  });

  it('tally.so 서브도메인도 화이트리스트', () => {
    expect(isTemplatedExternalUrl('https://forms.tally.so/r/abc')).toBe(true);
  });

  it('forms.staircrusher.club 서브도메인은 화이트리스트 아님 (정확 매칭)', () => {
    expect(
      isTemplatedExternalUrl('https://sub.forms.staircrusher.club/x'),
    ).toBe(false);
  });

  it('forms.gle 같은 다른 폼 도메인은 화이트리스트 아님', () => {
    expect(isTemplatedExternalUrl('https://forms.gle/abc')).toBe(false);
  });

  it('일반 도메인은 화이트리스트 아님', () => {
    expect(isTemplatedExternalUrl('https://example.com/x')).toBe(false);
  });

  it('파싱 불가 문자열은 false', () => {
    expect(isTemplatedExternalUrl('not a url')).toBe(false);
  });
});

describe('resolveTemplatedExternalUrl', () => {
  const userId = 'user-123';

  it('화이트리스트 도메인 + placeholder → 치환', () => {
    expect(
      resolveTemplatedExternalUrl(
        'https://forms.staircrusher.club/feedback?userId={userId}',
        {userId},
      ),
    ).toBe('https://forms.staircrusher.club/feedback?userId=user-123');
  });

  it('placeholder 가 여러 번 등장하면 모두 치환', () => {
    expect(
      resolveTemplatedExternalUrl(
        'https://tally.so/r/x?userId={userId}&ref={userId}',
        {userId},
      ),
    ).toBe('https://tally.so/r/x?userId=user-123&ref=user-123');
  });

  it('userId 는 URL 인코딩됨', () => {
    expect(
      resolveTemplatedExternalUrl(
        'https://forms.staircrusher.club/x?userId={userId}',
        {userId: 'a b/c'},
      ),
    ).toBe('https://forms.staircrusher.club/x?userId=a%20b%2Fc');
  });

  it('화이트리스트 외 도메인은 placeholder 가 있어도 원본 반환', () => {
    expect(
      resolveTemplatedExternalUrl('https://example.com/?userId={userId}', {
        userId,
      }),
    ).toBe('https://example.com/?userId={userId}');
  });

  it('화이트리스트 도메인이어도 placeholder 가 없으면 그대로 반환', () => {
    expect(
      resolveTemplatedExternalUrl(
        'https://forms.staircrusher.club/contents-alarm',
        {userId},
      ),
    ).toBe('https://forms.staircrusher.club/contents-alarm');
  });

  it('userId 가 undefined 이면 원본 반환 ({userId} 가 그대로 남음)', () => {
    expect(
      resolveTemplatedExternalUrl(
        'https://forms.staircrusher.club/x?userId={userId}',
        {userId: undefined},
      ),
    ).toBe('https://forms.staircrusher.club/x?userId={userId}');
  });

  it('파싱 불가 URL 은 원본 반환', () => {
    expect(resolveTemplatedExternalUrl('not a url {userId}', {userId})).toBe(
      'not a url {userId}',
    );
  });
});
