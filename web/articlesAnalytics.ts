/**
 * 정적 `/articles` 페이지 전용 계측 번들 (webpack entry `articles-analytics`).
 *
 * ── 왜 별도 번들인가
 * `/articles` 는 `scripts/article-template.js` 가 만드는 **독립 정적 HTML** 이다. SPA 번들
 * (react-navigation + Logger + SccPressable) 을 안 타므로 앱의 자동 로깅이 하나도 걸리지 않는다.
 * 실측(2026-07-08~08-06): `/articles` 의 element_click 0건, element_view 0건, page_dwell 0건,
 * user_id 0건. 그런데 앱 홈의 ArticleSection 이 이 페이지로 웹뷰 트래픽을 보내고 있다.
 *
 * SPA 번들 전체를 정적 페이지에 싣는 건 과하고(수 MB), 계측 로직만 따로 묶는다.
 * `pageDwellTracker` 는 SPA 와 **같은 모듈을 그대로 재사용**한다 — 로직을 복제하지 않는다.
 *
 * ── 이벤트/파라미터는 앱과 동일한 shape 이어야 한다
 * 앱: `screen_view{screen_name, screen_class}`, `element_click{element_name, screen_name}`,
 *     `element_view{element_name, screen_name}` (src/logging/Logger.ts).
 * 여기서도 같은 이름·같은 키를 쓴다. 이름이 갈리면 세 표면을 한 쿼리로 비교할 수 없다.
 * userId/surface 는 head 스니펫(web/gaBootstrap.js)이 이미 심어둔다.
 *
 * 계측 대상은 템플릿이 `data-element-name` 으로 선언한다(노출까지 원하면 `data-track-view`).
 * 위임 리스너라서 목록 페이지가 카드를 다시 렌더해도 클릭 계측이 끊기지 않는다.
 */

// 체류시간: SPA 와 동일 구현 재사용 (side-effect import). 이 모듈의 history 후킹은
// 정적 페이지에선 사실상 no-op 이고, visibility 누적 + pagehide 비콘이 그대로 동작한다.
import './utils/pageDwellTracker';

type GtagFn = (
  command: 'event',
  eventName: string,
  params: Record<string, unknown>,
) => void;

const ELEMENT_NAME_ATTR = 'data-element-name';
const TRACK_VIEW_ATTR = 'data-track-view';
/** 요소 단위 slug (목록 카드). 상세 페이지는 body 의 data-slug 로 충분하다. */
const LOG_SLUG_ATTR = 'data-log-slug';

function getGtag(): GtagFn | null {
  const gtag = (window as unknown as {gtag?: GtagFn}).gtag;
  return typeof gtag === 'function' ? gtag : null;
}

/** 템플릿이 `<body data-screen-name data-slug>` 로 선언한 화면 맥락. */
function screenContext(): {screen_name: string; slug?: string} {
  const body = document.body;
  const screenName = body?.getAttribute('data-screen-name') ?? 'Article';
  const slug = body?.getAttribute('data-slug') ?? undefined;
  return slug ? {screen_name: screenName, slug} : {screen_name: screenName};
}

function logEvent(eventName: string, params: Record<string, unknown>): void {
  getGtag()?.('event', eventName, {...screenContext(), ...params});
}

/** 요소가 자기 slug 를 선언했으면(목록 카드) 화면 기본값보다 우선한다. */
function elementParams(element: Element, name: string): Record<string, unknown> {
  const slug = element.getAttribute(LOG_SLUG_ATTR);
  return slug ? {element_name: name, slug} : {element_name: name};
}

/**
 * 앱의 `Logger.logScreenView` 대응. GA4 가 자동 발사하는 `page_view` 와 별개로,
 * 앱과 같은 이름의 `screen_view` 를 남겨야 화면 단위 비교가 된다.
 * (screen_class 를 screen_name 과 같게 두는 것도 앱과 동일 — Logger.ts logScreenView)
 */
function logScreenView(): void {
  const {screen_name: screenName} = screenContext();
  logEvent('screen_view', {screen_class: screenName});
}

function elementNameOf(target: EventTarget | null): {
  name: string;
  element: HTMLElement;
} | null {
  if (!(target instanceof Element)) return null;
  const element = target.closest(`[${ELEMENT_NAME_ATTR}]`);
  if (!(element instanceof HTMLElement)) return null;
  const name = element.getAttribute(ELEMENT_NAME_ATTR);
  return name ? {name, element} : null;
}

/**
 * 클릭은 document 위임으로 받는다 — 목록 페이지는 카테고리 필터/더보기로 카드를
 * 다시 렌더하므로, 요소마다 리스너를 붙이면 재렌더된 요소에서 계측이 사라진다.
 * capture 단계에서 받는 이유: 앵커의 기본 동작(새 탭 이동)이나 기존 핸들러의
 * stopPropagation 에 관계없이 기록되어야 한다.
 */
function installClickTracking(): void {
  document.addEventListener(
    'click',
    event => {
      const hit = elementNameOf(event.target);
      if (!hit) return;
      logEvent('element_click', elementParams(hit.element, hit.name));
    },
    true,
  );
}

/**
 * 노출은 `data-track-view` 를 붙인 요소만(앱의 `trackView` opt-in 과 동일 정책).
 * 요소당 1회만 발사하고 바로 관찰을 끊는다.
 *
 * 목록 페이지의 카드는 전부 SSR 로 DOM 에 있고 필터/더보기는 `hidden` 만 토글한다
 * (article-template.js 의 render()). hidden 요소는 교차하지 않다가 노출되는 순간
 * 교차하므로, 설치 시점 한 번만 훑어도 나중에 보이는 카드까지 잡힌다.
 */
function installViewTracking(): void {
  if (typeof IntersectionObserver === 'undefined') return;

  const observer = new IntersectionObserver(
    entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const name = entry.target.getAttribute(ELEMENT_NAME_ATTR);
        observer.unobserve(entry.target);
        if (name) {
          logEvent('element_view', elementParams(entry.target, name));
        }
      }
    },
    {threshold: 0.5},
  );

  document
    .querySelectorAll(`[${ELEMENT_NAME_ATTR}][${TRACK_VIEW_ATTR}]`)
    .forEach(target => observer.observe(target));
}

function install(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  logScreenView();
  installClickTracking();
  installViewTracking();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', install, {once: true});
} else {
  install();
}
