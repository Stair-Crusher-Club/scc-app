import {describe, expect, it} from '@jest/globals';

import {
  ArticleManifestEntry,
  getLatestArticles,
  selectArticles,
} from './articles';

const entry = (
  over: Partial<ArticleManifestEntry> & {slug: string},
): ArticleManifestEntry => ({
  title: `제목 ${over.slug}`,
  summary: '',
  image: `/articles/${over.slug}/assets/img-0.png`,
  createdTime: '2026-01-01T00:00:00.000Z',
  publishedAt: '2026-01-01T00:00:00.000Z',
  editedTime: '2026-01-01T00:00:00.000Z',
  contentPageId: `page-${over.slug}`,
  ...over,
});

describe('selectArticles', () => {
  it('parent 있는 엔트리(상세 페이지)는 제외한다', () => {
    const result = selectArticles(
      [
        entry({slug: 'guide'}),
        entry({slug: 'guide/seoul', parent: 'guide'}),
        entry({slug: 'guide/busan', parent: 'guide'}),
      ],
      10,
    );

    expect(result.map(a => a.slug)).toEqual(['guide']);
  });

  it('featured(숫자)가 최신 글보다 앞선다', () => {
    const result = selectArticles(
      [
        entry({slug: 'newest', publishedAt: '2026-08-01T00:00:00.000Z'}),
        entry({
          slug: 'pinned',
          publishedAt: '2026-01-01T00:00:00.000Z',
          featured: 1,
        }),
      ],
      10,
    );

    expect(result.map(a => a.slug)).toEqual(['pinned', 'newest']);
  });

  // manifest의 featured는 대부분 null이다(값이 들어간 건 1건뿐). null을 0으로 취급하면
  // 발행분 전체가 최신순을 잃고 뒤섞인다.
  it('featured가 null/undefined면 최신순으로 밀린다', () => {
    const result = selectArticles(
      [
        entry({slug: 'old', publishedAt: '2026-01-01T00:00:00.000Z'}),
        entry({
          slug: 'new',
          publishedAt: '2026-08-01T00:00:00.000Z',
          featured: null,
        }),
        entry({slug: 'mid', publishedAt: '2026-04-01T00:00:00.000Z'}),
      ],
      10,
    );

    expect(result.map(a => a.slug)).toEqual(['new', 'mid', 'old']);
  });

  it('featured끼리는 번호 오름차순이다', () => {
    const result = selectArticles(
      [
        entry({slug: 'second', featured: 2}),
        entry({slug: 'first', featured: 1}),
      ],
      10,
    );

    expect(result.map(a => a.slug)).toEqual(['first', 'second']);
  });

  it('count만큼만 자른다', () => {
    const entries = ['a', 'b', 'c', 'd'].map(slug => entry({slug}));

    expect(selectArticles(entries, 3)).toHaveLength(3);
  });

  // 원본 PNG는 3~7MB라 홈 카드에 그대로 나가면 안 된다. thumbnail이 있으면 반드시 그쪽을 쓴다.
  it('thumbnail이 있으면 thumbnail을, 없으면 image를 절대 URL로 만든다', () => {
    const [withThumb, withoutThumb] = selectArticles(
      [
        entry({
          slug: 'compressed',
          featured: 1,
          thumbnail: '/articles/compressed/assets/thumb-0.webp',
        }),
        entry({slug: 'raw', featured: 2}),
      ],
      10,
    );

    expect(withThumb.imageUrl).toBe(
      'https://web.staircrusher.club/articles/compressed/assets/thumb-0.webp',
    );
    expect(withoutThumb.imageUrl).toBe(
      'https://web.staircrusher.club/articles/raw/assets/img-0.png',
    );
  });

  it('dateLabel은 YYYY.MM.DD, url은 웹 아티클 주소다', () => {
    const [article] = selectArticles(
      [entry({slug: 'hello', publishedAt: '2026-08-04T09:52:00.000Z'})],
      1,
    );

    expect(article.dateLabel).toBe('2026.08.04');
    expect(article.url).toBe('https://web.staircrusher.club/articles/hello');
  });
});

describe('getLatestArticles (실제 manifest)', () => {
  it('번들된 manifest에서 3개를 뽑고 전부 절대 URL + 날짜 포맷을 갖는다', () => {
    const articles = getLatestArticles(3);

    expect(articles).toHaveLength(3);
    for (const article of articles) {
      expect(article.title).not.toBe('');
      expect(article.imageUrl).toMatch(/^https:\/\/web\.staircrusher\.club\//);
      expect(article.url).toMatch(
        /^https:\/\/web\.staircrusher\.club\/articles\/[^/]+$/,
      );
      expect(article.dateLabel).toMatch(/^\d{4}\.\d{2}\.\d{2}$/);
    }
  });
});
