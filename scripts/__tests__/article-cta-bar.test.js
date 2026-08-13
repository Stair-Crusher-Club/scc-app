// 상세 하단 고정 CTA 바 (Figma 72:1445). 두 변형을 모두 그려두고 ?from=kakao 로 CSS 토글하므로,
// "어떤 href/문구가 어느 변형에 붙었는지" 는 렌더 결과 문자열로만 검증할 수 있다.
const {
  CTA,
  withCampaign,
  renderArticlePage,
  renderListPage,
} = require('../article-template');

const article = (over = {}) =>
  renderArticlePage({
    title: '테스트 글',
    summary: '요약',
    slug: 'test-slug',
    faq: [],
    contentHtml: '<p>본문</p>',
    ogImageUrl: '',
    publishedAt: '2026-08-07T00:00:00.000Z',
    lastEditedTime: '2026-08-07T00:00:00.000Z',
    ...over,
  });

// href 는 escapeHtml 을 거쳐 & → &amp; 가 된다.
const hrefOf = (html, variant) => {
  const m = new RegExp(
    `<a class="cta-main cta-${variant}" data-cta-variant="${variant}"[^>]*? href="([^"]+)"`,
  ).exec(html);
  return m && m[1].replace(/&amp;/g, '&');
};
const browseLabelOf = html =>
  /data-cta-variant="browse"[^>]*>([^<]*)</.exec(html)[1];

describe('withCampaign', () => {
  test('campaign 파라미터를 붙인다', () => {
    expect(withCampaign('https://link.x/abc', 'my-slug', 'cta-browse')).toBe(
      'https://link.x/abc?campaign=articles-cta&ad_group=my-slug&ad_creative=cta-browse',
    );
  });

  test('이미 있는 키는 덮어쓰지 않는다 (Notion 에 파라미터가 박힌 URL 이 들어와도 안전)', () => {
    const out = withCampaign(
      'https://link.x/abc?ad_group=hand-written&foo=1',
      'my-slug',
      'cta-browse',
    );
    expect(out).toContain('ad_group=hand-written');
    expect(out).not.toContain('ad_group=my-slug');
    expect(out).toContain('foo=1');
    expect(out).toContain('ad_creative=cta-browse');
  });

  test('fragment 는 항상 맨 뒤에 남는다', () => {
    expect(withCampaign('https://link.x/a#sec', 's', 'c')).toBe(
      'https://link.x/a?campaign=articles-cta&ad_group=s&ad_creative=c#sec',
    );
  });
});

describe('CTA 바 렌더', () => {
  // 사용자 피드백(2026-08-07): 하트 아이콘만 빨강, 버튼 네모 테두리는 기본 회색 유지.
  // 테두리까지 빨강이면 버튼이 에러 상태처럼 보인다.
  test('좋아요 누른 상태는 하트만 빨강이고 테두리는 그대로다', () => {
    const html = article();
    expect(html).not.toContain('aria-pressed="true"]{border-color');
    // 쓰이지 않는 --red 토큰이 되살아나면(= 테두리 규칙 복귀) 실패한다
    expect(html).not.toContain('--red:');
    const svg = require('fs').readFileSync(
      require('path').join(
        __dirname,
        '../../web-articles/_assets/ic-heart-fill.svg',
      ),
      'utf8',
    );
    expect(svg).toContain('fill="#DB0B24"');
    expect(svg).toContain('stroke="#DB0B24"');
    expect(svg).not.toContain('#0C76F7'); // 디자인시스템 기본 파랑이 남아있으면 안 된다
  });

  test('두 CTA 모두 새 탭으로 연다', () => {
    const html = article();
    for (const v of ['kakao', 'browse']) {
      const tag = new RegExp(`<a class="cta-main cta-${v}"[^>]*>`).exec(
        html,
      )[0];
      expect(tag).toContain('target="_blank"');
      // 새 탭에 window.opener 를 넘기지 않는다
      expect(tag).toContain('rel="noopener noreferrer"');
    }
  });

  test('두 변형과 분기 스크립트가 모두 들어간다', () => {
    const html = article();
    expect(html).toContain('data-testid="article-cta-bar"');
    expect(html).toContain('class="cta-main cta-kakao"');
    expect(html).toContain('class="cta-main cta-browse"');
    // 페인트 전에 <head> 에서 분기해야 깜빡임이 없다
    const headEnd = html.indexOf('</head>');
    expect(html.indexOf("setAttribute('data-cta','list')")).toBeLessThan(
      headEnd,
    );
    expect(html).toContain('<body class="has-cta" data-screen-name="Article"');
  });

  // 사용자 피드백(2026-08-13): 카카오로 들어온 뒤 다른 글로 넘어가면 CTA 가 '채널추가'로
  // 되돌아갔다. 분기 판정을 세션에 남겨 탭이 살아있는 동안 유지한다.
  // 인라인 스크립트라 실행 테스트가 어려운 다른 케이스들과 달리, 이 스니펫은 전역 3개만
  // 참조하므로 실제로 돌려서 검증한다.
  describe('카카오 유입 분기는 세션 동안 유지된다', () => {
    // <head> 인라인 스크립트를 꺼내 stub 전역으로 실행한다.
    const run = (search, store, throwing = false) => {
      const body = /<script>(\(function\(\)\{var k=[\s\S]*?)<\/script>/.exec(
        article(),
      )[1];
      const ss = throwing
        ? {
            getItem() {
              throw new Error('SecurityError');
            },
            setItem() {
              throw new Error('SecurityError');
            },
          }
        : {
            getItem: k => (k in store ? store[k] : null),
            setItem: (k, v) => {
              store[k] = v;
            },
          };
      let attr = null;
      const doc = {
        documentElement: {
          setAttribute: (k, v) => {
            attr = `${k}=${v}`;
          },
        },
      };
      // 스니펫이 참조하는 전역 3개만 sandbox 로 넣어준다.
      require('vm').runInNewContext(body, {
        location: {search},
        sessionStorage: ss,
        document: doc,
      });
      return attr;
    };

    test('?from=kakao 로 들어오면 분기 + 세션에 기록', () => {
      const store = {};
      expect(run('?from=kakao', store)).toBe('data-cta=list');
      expect(store.sccFromKakao).toBe('1');
    });

    test('같은 세션의 다음 글은 쿼리가 없어도 분기가 유지된다', () => {
      const store = {};
      run('?from=kakao', store);
      expect(run('', store)).toBe('data-cta=list');
    });

    test('새 세션에서 쿼리 없이 들어오면 플친 가입 CTA 다', () => {
      expect(run('', {})).toBe(null);
      // 검색 유입에 다른 파라미터만 붙은 경우도 마찬가지
      expect(run('?utm_source=google', {})).toBe(null);
    });

    test('sessionStorage 가 막힌 환경에서도 URL 판정은 살아있다', () => {
      expect(run('?from=kakao', {}, true)).toBe('data-cta=list');
      expect(run('', {}, true)).toBe(null);
    });
  });

  test('ctaUrl 이 비면 콘텐츠 홈 + 폴백 문구다 (B 버킷 / 저장리스트 미보유 A 버킷)', () => {
    const html = article();
    expect(hrefOf(html, 'browse')).toContain(CTA.home);
    expect(browseLabelOf(html)).toBe(CTA.browseLabel);
  });

  test('ctaUrl/ctaLabel 이 있으면 그대로 쓴다 (A 버킷 저장리스트)', () => {
    const html = article({
      ctaUrl: 'https://link.staircrusher.club/anguk_save',
      ctaLabel: '소개된 곳 모아보기',
    });
    const href = hrefOf(html, 'browse');
    expect(href).toContain('https://link.staircrusher.club/anguk_save');
    expect(href).toContain('ad_group=test-slug');
    expect(href).toContain('ad_creative=cta-browse');
    expect(browseLabelOf(html)).toBe('소개된 곳 모아보기');
  });

  test('ctaUrl 만 있으면 문구는 폴백이다 (C 버킷 카테고리 링크)', () => {
    const html = article({
      ctaUrl: 'https://link.staircrusher.club/articles_cta_transit',
    });
    expect(hrefOf(html, 'browse')).toContain('articles_cta_transit');
    expect(browseLabelOf(html)).toBe(CTA.browseLabel);
  });

  test('카카오 변형은 플친 링크 + cta-kakao creative 다', () => {
    const href = hrefOf(article(), 'kakao');
    expect(href).toContain('articles_footer_kakao');
    expect(href).toContain('ad_creative=cta-kakao');
  });

  test('좋아요 대상은 canonical URL 로 조회한다 (?from=kakao·로컬 주소에 영향 없음)', () => {
    expect(article()).toContain(
      "var PAGE_URL='https://web.staircrusher.club/articles/'+SLUG",
    );
  });

  // 사용자 피드백(2026-08-07): 공유는 그냥 URL 이 아니라 유입 집계가 되는 URL 이어야 한다.
  // 에어브릿지 트래킹링크는 자기 OG 를 서빙해 카톡 미리보기를 깨므로 canonical+campaign 을 쓴다.
  test('공유는 campaign 파라미터가 붙은 canonical 을 쓴다', () => {
    const html = article();
    const shareUrl = /var SHARE_URL="([^"]+)"/.exec(html)[1];
    expect(shareUrl).toBe(
      'https://web.staircrusher.club/articles/test-slug' +
        '?campaign=articles-share&ad_group=test-slug&ad_creative=cta-share',
    );
    // Web Share·클립보드 폴백 **둘 다** SHARE_URL 이어야 한다 (한쪽만 바꾸는 실수 방지)
    const body = html.slice(html.indexOf("log('article_share'"));
    expect(body).toContain(
      'navigator.share({title:document.title,url:SHARE_URL})',
    );
    expect(body).toContain('writeText(SHARE_URL)');
    // 좋아요 target 은 파라미터 없는 canonical 이어야 한다 — 둘을 섞으면 카운터가 갈린다
    expect(body).not.toContain('writeText(PAGE_URL)');
    expect(shareUrl).not.toContain('link.staircrusher.club');
  });

  test('SPA 로그인 토큰 키에는 절대 쓰지 않는다', () => {
    const html = article();
    // webpack 이 react-native-mmkv 를 web/mocks 로 alias 해서 현재 키는 dot 구분자다.
    // alias 를 떼면 실제 패키지의 backslash(KEY_WILDCARD) 포맷이 되므로 둘 다 읽는다.
    expect(html).toContain("'mmkv.default.scc-token'");
    expect(html).toContain('mmkv.default\\\\scc-token');
    expect(html).not.toContain("setItem('mmkv.default");
    expect(html).not.toContain("removeItem('mmkv.default");
  });

  // 회귀: slug 는 Notion 자유입력이다. `</script>` 가 들어오면 인라인 스크립트가 조기 종료돼
  // 임의 마크업이 실행된다. 같은 파일 jsonLd() 가 쓰는 < 이스케이프를 articleJs 에도 적용.
  test('slug 의 </script> 가 인라인 스크립트를 깨지 않는다', () => {
    const html = article({slug: '</script><script>alert(1)</script>'});
    expect(/var SLUG=(.*);/.exec(html)[1]).not.toContain('</script>');
    expect(html).not.toContain('<script>alert(1)</script>');
  });

  // 회귀: 만료된 SPA 토큰으로 401 이 날 때마다 익명 토큰까지 지우고 새 익명 유저를 발급해서,
  // giveUpvote 와 cancelUpvote 가 서로 다른 유저로 기록됐다 → 취소가 no-op 이 되고 유령 행이 남았다.
  // (로컬 서버 E2E 로 실측된 버그. 인라인 JS 라 실행 테스트가 어려워 구조 불변식으로 지킨다)
  test('SPA 토큰 401 은 익명 정체성을 버리지 않는다', () => {
    const html = article();
    const sendBody = html.slice(
      html.indexOf('function send('),
      html.indexOf('function viaAnon('),
    );
    expect(sendBody).toContain('spaTokenBad=true');
    expect(sendBody).not.toContain('removeItem');
    // 익명 토큰 폐기·재발급은 익명 토큰 자신이 401 일 때만 (viaAnon 안)
    expect(html.slice(html.indexOf('function viaAnon('))).toContain(
      "removeItem('anonymousAccessToken')",
    );
  });

  test('익명 토큰은 캐시를 먼저 쓴다 (호출마다 새 유저를 만들지 않는다)', () => {
    const anonBody = article().match(
      /function anonToken\(cb\)\{[\s\S]*?\n {2}\}/,
    )[0];
    // getItem → 있으면 그대로 사용 → 없을 때만 mintToken
    expect(anonBody.indexOf("getItem('anonymousAccessToken')")).toBeLessThan(
      anonBody.indexOf('mintToken'),
    );
    expect(anonBody).toContain('if(t){cb(t);return;}');
  });
});

describe('목록 페이지', () => {
  const list = () =>
    renderListPage([
      {
        slug: 'a',
        title: 'A',
        summary: '',
        image: '',
        publishedAt: '2026-08-07T00:00:00.000Z',
        categories: ['이동/교통'],
      },
    ]);

  test('목록에는 CTA 바가 없다', () => {
    expect(list()).not.toContain('article-cta-bar');
  });

  test('칩에 URL 용 ASCII slug 가 붙는다', () => {
    const html = list();
    expect(html).toContain('data-cat="이동/교통" data-slug="transit"');
    expect(html).toContain('data-cat="맛집/카페" data-slug="food"');
    // 모르는 slug 는 전체로 폴백해야 한다 (오타 URL 이 빈 목록을 띄우면 안 된다)
    expect(html).toContain("if(!m) return '';");
  });
});
