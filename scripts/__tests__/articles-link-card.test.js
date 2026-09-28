// 링크 카드(linkUrl): 상세 페이지 없이 목록 카드가 곧장 외부 URL 로 가야 한다.
const {renderListPage} = require('../article-template');
const {selectArticles} = require('../../src/utils/articles');

const LINK = 'https://forms.staircrusher.club/x?ref=app_home';
const entries = [
  {
    slug: 'link',
    title: '배너',
    summary: '',
    image: '',
    createdTime: '',
    publishedAt: '2026-09-28T00:00:00.000Z',
    editedTime: '',
    contentPageId: '',
    linkUrl: LINK,
  },
  {
    slug: 'post',
    title: '글',
    summary: '',
    image: '',
    createdTime: '',
    publishedAt: '2026-09-01T00:00:00.000Z',
    editedTime: '',
    contentPageId: '',
  },
];

test('목록: 링크 카드 href 는 linkUrl(새 탭), 일반 글은 상세, JSON-LD 에서 제외', () => {
  const html = renderListPage(entries);
  const hrefs = [
    ...html.matchAll(/<a class="(?:feat|card)" (href="[^"]+"[^>]*?) data-cat/g),
  ].map(m => m[1]);
  const ext = `href="${LINK}" target="_blank" rel="noopener noreferrer"`;
  expect(hrefs).toEqual([ext, ext, 'href="/articles/post"']); // feat + 카드 목록
  expect(html).not.toContain('/articles/link"');
  expect(html).not.toMatch(/"headline":"배너"/);
});

test('앱 홈: 링크 카드는 linkUrl 로 연다', () => {
  expect(selectArticles(entries, 2).map(a => a.url)).toEqual([
    LINK,
    'https://web.staircrusher.club/articles/post',
  ]);
});
