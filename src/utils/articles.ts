import manifest from '../../web-articles/manifest.json';

const WEB_ORIGIN = 'https://web.staircrusher.club';

export const ARTICLES_LIST_URL = `${WEB_ORIGIN}/articles`;
export const ARTICLE_AUTHOR = '계단뿌셔클럽';

/**
 * web-articles/manifest.json 한 엔트리. /scc-web-articles-publish 발행 스킬이 갱신한다.
 * parent/featured/categories/thumbnail은 일부 엔트리에만 있어서 JSON 추론 타입이 union이 되고
 * 그대로는 프로퍼티 접근이 막힌다 → 아래에서 이 타입으로 캐스팅해 쓴다.
 */
export interface ArticleManifestEntry {
  slug: string;
  title: string;
  summary: string;
  image: string;
  createdTime: string;
  publishedAt: string;
  editedTime: string;
  contentPageId: string;
  /** 목록 상단 고정 순번. 값이 없거나 null이면 최신순으로 밀린다. */
  featured?: number | null;
  categories?: string[];
  /** 있으면 상세 페이지. 홈/목록에는 노출하지 않는다. */
  parent?: string;
  /** 압축 썸네일(webp). build-articles.js가 생성. 없으면 원본 image로 폴백. */
  thumbnail?: string;
}

export interface Article {
  slug: string;
  title: string;
  imageUrl: string;
  /** `2026.08.04` */
  dateLabel: string;
  url: string;
}

const MANIFEST = manifest as unknown as Record<string, ArticleManifestEntry>;

// 웹 목록 페이지와 **같은** comparator (scripts/build-articles.js reassembleDist).
// 홈 상위 3개 = web.staircrusher.club/articles 상단 3개가 되도록 일부러 일치시킨다.
const rank = (a: ArticleManifestEntry) =>
  typeof a.featured === 'number' ? a.featured : Infinity;
const pub = (a: ArticleManifestEntry) => a.publishedAt || a.createdTime || '';

// scripts/article-template.js fmtDate와 동일 규칙.
const formatDate = (iso: string) => (iso || '').slice(0, 10).replace(/-/g, '.');

export function selectArticles(
  entries: ArticleManifestEntry[],
  count: number,
): Article[] {
  return entries
    .filter(entry => !entry.parent)
    .sort((a, b) => rank(a) - rank(b) || pub(b).localeCompare(pub(a)))
    .slice(0, count)
    .map(entry => ({
      slug: entry.slug,
      title: entry.title,
      imageUrl: `${WEB_ORIGIN}${entry.thumbnail ?? entry.image}`,
      dateLabel: formatDate(entry.publishedAt),
      url: `${WEB_ORIGIN}/articles/${entry.slug}`,
    }));
}

export function getLatestArticles(count: number): Article[] {
  return selectArticles(Object.values(MANIFEST), count);
}
