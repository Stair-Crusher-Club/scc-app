---
name: scc-web-articles-publish
description: Notion에 작성한 콘텐츠를 web.staircrusher.club/articles 정적 페이지로 발행해 검색엔진(SEO) + AI답변엔진(AEO/GEO)에 노출시킨다. "노션 글 발행해줘", "아티클 올려줘", "articles 갱신", "노션 콘텐츠 검색에 걸리게", "article list DB 렌더링" 같은 요청 시 사용. 사람은 Notion에 제목+본문만 쓰고, 이 스킬이 메타데이터(slug/summary/category/ogImage/faq)를 LLM으로 생성해 DB에 라이트백한 뒤, 결정론적 노드 스크립트로 본문을 HTML로 변환한다. last_edited_time 기반 incremental — 신규/변경/삭제 문서만 처리해 토큰을 아낀다. STEP 1~7을 끝까지 실행해 **prod(web.staircrusher.club) 배포 + main 머지까지 자동으로 완주**한다 — 커밋이나 PR에서 멈추지 않는다.
---

# SCC Web Articles Publish — Notion → web.staircrusher.club/articles

## 목적

팀이 Notion으로 만든 콘텐츠는 Notion publish로는 **검색에 안 걸려 신규 유입이 0**이다. 이 스킬은 그 콘텐츠를 우리 도메인(`web.staircrusher.club/articles`)의 **완전 정적 HTML**로 발행해 SEO + AEO/GEO 유입을 만든다.

- iframe 아님(`X-Frame-Options`로 막히고 SEO 크레딧이 notion으로 샘). **블록→HTML 1회 변환 후 정적 서빙**.
- 사람은 **제목+본문만** 작성. 나머지 메타는 스킬이 생성·DB 라이트백.
- 본문 변환은 **결정론적**(노드 스크립트, LLM 토큰 0). 메타 생성만 LLM, 그것도 **신규/변경분만**.
- **완주 지점은 prod 배포(STEP 6) + main 머지(STEP 7)** — S3에 안 올라가면 검색 유입 0이고, main에 안 들어가면 다음 재빌드 때 발행본이 날아간다. "배포할까요?"/"머지할까요?"로 멈추지 않는다.

## 구성 요소 (이미 레포에 있음)

| 파일 | 역할 |
|------|------|
| `scripts/build-articles.js` | 결정론적 생성기: DB 쿼리 → incremental diff → 블록 fetch → 시맨틱 HTML + 이미지 다운로드 + manifest + sitemap/robots/llms |
| `scripts/article-template.js` | 자체 반응형 셸 + SEO 메타 + JSON-LD(Article/FAQPage) + GA4. 480px SPA 프레임 안 탐 |
| `web-articles/` (git-tracked) | `manifest.json`(=발행됨의 근거) + `{slug}/index.html` + `{slug}/assets/*` 커밋본 |
| `scc-server/.../lambda/seo-handler.js` | `/articles*`를 UA 무관 항상 `index.html`로 리라이트(STATIC_PATTERNS) |

## 전제조건 (최초 1회)

1. **Notion integration**: https://www.notion.so/my-integrations 에서 internal integration 생성 → secret 발급.
2. **DB 공유**: article-list DB(+ 하위 페이지)를 그 integration에 share.
3. **토큰**: `export NOTION_TOKEN=...` (커밋 금지). DB id는 DB URL의 32자 hex.
   - **토큰 위치(이 환경)**: `~/.claude.json`의 notion MCP 서버 env에 `NOTION_TOKEN`(ntn_…)로 저장돼 있음. 빌드 시 로그 노출 없이 주입:
     ```bash
     NOTION_TOKEN=$(python3 -c "import json,re;print(re.search(r'\"NOTION_TOKEN\"\s*:\s*\"(ntn_[A-Za-z0-9]+)\"',json.dumps(json.load(open(__import__('os').path.expanduser('~/.claude.json'))))).group(1))") \
       node scripts/build-articles.js --db <database_id>
     ```
   - **발행 대상 article-list DB**: `383c9499b06080639b1be2bcdc48981c` (Notion "web.staircrusher.club 아티클").
4. **의존성**: `yarn add @notionhq/client` (scc-app).
5. **Lambda 배포(1회)**: `seo-handler.js`의 `/articles` 패턴을 반영하려면 Lambda@Edge 재배포 필요.
   `/scc-infra-ops` 절차로 `staircrusher-club-web` 모듈 `aws-vault exec swann-scc -- terraform apply`. (사용자 명시 요청 시에만)

## Notion DB 스키마 (최소화 — 사람은 글만 쓴다)

- **사람이 작성**: 페이지 **제목**(= h1/`<title>`) + **본문**. 그게 전부.
- **제목에 `[WIP]`가 있으면 발행 대상에서 제외**(대소문자 무시). 파이프라인 진입 전에 걸러내므로 메타가 없어도 경고가 안 뜬다. 이미 발행된 글에 `[WIP]`를 붙이면 삭제 판정에 걸려 **prod에서 내려간다**(= 발행 취소).
- **사람이 선택적으로 지정**:
  - `featured` (number, 선택) — 목록 상단 고정. 값이 있는 글이 `1`, `2`, `3`… 오름차순으로 맨 위에 오고, 비어 있으면 일반 글(`createdTime` 내림차순). **순서는 코드에 하드코딩하지 않는다** — 이 컬럼이 유일한 노출 순서 제어 수단이다. (일반화: 운영자가 바꿀 노출/편집 데이터는 코드 상수가 아니라 DB 컬럼으로 뺀다.)
    > **★ row 프로퍼티 함정**: incremental 판정 기준은 **본문 페이지**의 `last_edited_time`이라, DB row의 `featured`만 고치면 본문 시각이 그대로여서 **재빌드가 안 걸린다**. 그래서 `featured`·`category` 동기화는 changed 루프 **밖에서** 매번 돌린다(DB 쿼리는 이미 끝난 뒤라 추가 API 호출 0). row 프로퍼티만으로 출력이 달라지는 필드를 새로 추가할 땐 같은 처리가 필요하다 — changed 루프 안에만 넣으면 조용히 반영이 안 된다.
- **빌드가 자동 기록**:
  - `publishedAt` (date) — **최초 발행 시각의 source of truth**. 비어 있으면 빌드가 지금 시각을 찍어 DB에 써넣고(`stampPublishedAt`), 이후 재빌드해도 그 값을 유지한다. `datePublished`(JSON-LD)·화면 표시 날짜·목록 정렬이 전부 이 값을 쓴다.
    > **★ 원본 created_time 쓰지 말 것**: 대부분 mention row라 "팀이 원본 글을 처음 만든 날"이 잡히고, URL이 생기기도 전 날짜가 `datePublished`로 나간다(실제 PROD 버그. 경복궁 — row 08-04, 원본 07-21). 상세 페이지는 DB row가 아니라 부모의 `publishedAt`을 따른다.
    > **★ Notion date는 분 단위 절삭**: `09:52:55`로 써도 `09:52:00`으로 돌아온다. 초까지 있는 값을 manifest/HTML에 넣어두면 재빌드마다 초 단위 diff가 나므로, DB에 쓴 뒤 그 값을 그대로 되읽어 쓴다.
- **스킬이 생성해 DB에 라이트백**(머신 관리, 사람은 손 안 댐):
  - `slug` (rich_text) — 제목+내용 기반 URL id
  - `summary` (rich_text) — 검색 최적 한줄 요약 (meta description/리드 겸용)
  - `category` (multi_select, **필수**) — 목록 페이지 카테고리 칩 필터의 유일한 근거. 허용값 5개(그 외 값은 어떤 칩에도 안 걸린다):

    | 값 | 범위 |
    |---|---|
    | `맛집/카페` | 식당, 카페 |
    | `공연/행사` | 페스티벌, 공연장, 야구장 |
    | `문화공간` | 아트센터, 도서관, 미술관, LP바 등 |
    | `여행/나들이` | 나들이·여행지, 지역 큐레이션 |
    | `이동/교통` | 장애인콜택시, 비행기 탑승 등 |

    - **1개가 원칙**. 정말 애매할 때만 2개(예: 마포아트센터 = `공연/행사`+`문화공간`). 3개 이상 금지.
    - 비어 있으면 빌드가 `needsMeta`로 스킵한다 → **신규 글은 발행되지 않는다**.
      단 **이미 발행된 글의 category를 지워도 prod에서 내려가지 않는다** — needsMeta row는 `rows`에 안 들어가
      manifest의 직전 값이 그대로 남고 `reassembleDist`가 그 값으로 재발행한다. 내리려면 `[WIP]`를 쓴다.
    - 허용값 외 문자열/3개 이상은 **경고만** 하고 발행은 막지 않는다(오타로 살아 있는 SEO 페이지를 내리지 않기 위함).
      잘못된 값은 `전체`에는 나오되 해당 칩으로 필터링되지 않는다.
    - 목록 정렬·칩 순서는 `scripts/article-template.js`의 `CATEGORIES` 상수가 정의한다.
  - `ogImage` (url, 선택) — 대표 이미지. 없으면 본문 첫 이미지 자동 사용
  - ~~`tags` (multi_select)~~ — **더 이상 렌더되지 않는다**. 상세 하단 태그 칩이 제거되면서(2026-08) 소비처가 사라졌다. 컬럼과 기존 값은 보존하지만 **새로 채우지 않는다**. 되살리려면 `build-articles.js:resolveRow`에서 읽어 `renderArticlePage`로 넘기면 된다
  - `faq` (rich_text, 선택) — `[{"q":"...","a":"..."}]` JSON 문자열 → FAQPage 스키마
  - `ctaUrl` (url, 선택) / `ctaLabel` (rich_text, 선택) — 상세 하단 고정 CTA 바의 목적지/문구.
    **비어 있는 게 정상값이다** — 템플릿이 콘텐츠 홈(`articles_cta_home`) + `다른 콘텐츠 더 보기`로 폴백한다.
    카카오 플친 메시지로 들어온 경우(`?from=kakao`)에만 이 버튼이 노출되고, 그 외에는 플친 가입 CTA가 뜬다.
    채우는 3버킷 규칙은 STEP 2 참조.
    > **★ 재빌드 함정**: `featured`/`category`와 달리 CTA는 **상세 HTML 안에** 렌더된다. `reassembleDist`는
    > 이미 빌드된 `web-articles/<slug>/index.html`을 그대로 복사하므로, Notion에서 CTA만 고치면 **화면이
    > 안 바뀐다**. `--only <slug>` 또는 `--force`로 그 글을 다시 렌더해야 한다. (manifest에는 감사용으로
    > 매번 동기화되므로, manifest 값과 HTML이 어긋나 있으면 재렌더가 안 된 것이다.)
- **`published` 프로퍼티 없음** — 발행 여부 = `web-articles/manifest.json`에 존재하는지로 판단.

## 콘텐츠 투입: mention row (다른 DB 글을 "옮기기")

이미 다른 Notion DB/페이지에 쓴 글을 발행하려면, article-list DB에 **제목이 그 페이지 mention인 row**를 만든다(원본은 그대로 둠). 빌드가 mention을 따라가 본문을 가져오고, 메타는 이 row 프로퍼티에서 읽는다.

```jsonc
// API-post-page: parent={type:"database_id", database_id:"383c…"}
"properties": {"Name": {"title": [
  {"type":"mention","mention":{"type":"page","page":{"id":"<원본 page id>"}}},
  {"type":"text","text":{"content":" "}}   // 뒤 공백 1칸(관례)
]}}
```

- 소스 컬렉션 DB의 글 목록은 `API-query-data-source`(child DB의 data_source id는 `API-retrieve-a-database`로 얻음)로 뽑는다.
- 대량이면 병렬 subagent에 (rowId 생성 + STEP 2 메타 라이트백)을 위임하되 **slug는 오케스트레이터가 미리 배정**(agent 간 충돌 방지).

## 절차

### STEP 1 — diff (무변경 문서는 건드리지 않는다)
```bash
NOTION_TOKEN=... node scripts/build-articles.js --db <database_id> --dry
```
- 출력의 "신규/변경 N · 삭제 K · 메타미비 M"을 확인. 변경 문서 목록을 STEP 2 대상으로 잡는다.
- "메타미비"(slug/summary/**category** 중 하나라도 없음)로 잡힌 문서가 STEP 2에서 메타를 채워야 하는 신규 글이다. 출력에 `[누락: ...]`로 어떤 필드가 비었는지 찍힌다.

### STEP 2 — 메타 생성 + DB 라이트백 (신규/변경분만, LLM)
변경된 각 문서에 대해:
1. 본문을 읽는다 — MCP `notion-fetch`(enhanced markdown)로 내용 파악.
2. **검색에 최대한 잘 걸리도록** 생성:
   - `slug`: **이미 값이 있으면 그대로 유지한다 (절대 재생성 금지).** 미리 배정된 slug 는 다른 스킬이 발급한 CTA 트래킹링크의 `ad_group` 파라미터와 같은 값이라, 바꾸면 유입 리포트와 웹 URL 이 어긋난다. 비어 있을 때만 생성: 영문 kebab-case, 핵심 키워드 포함, 적절한 길이(과도하게 길지 않게).
   - `summary`: 1~2문장, 핵심 답변을 앞에. 검색 의도 키워드 자연 포함.
   - `category`: **필수 · 1개**. 위 스키마 표의 5개 값 중에서만 고른다. 본문이 두 범주에 실제로 걸칠 때만 2개(3개 이상 금지). **비워두면 그 글은 발행되지 않는다.**
   - `ogImage`: 본문 내 대표 이미지 1개(없으면 비워둠 → 스크립트가 첫 이미지 사용).
   - `tags`: **생성하지 않는다** (렌더 소비처 없음 — 위 스키마 참고).
   - `faq`: 본문에 Q&A 성격이 있으면 `[{"q","a"}]`로(AEO 핵심). 없으면 생략.
   - `ctaUrl`/`ctaLabel`: 본문이 소개하는 대상으로 버킷을 판정해 정한다. **대부분 비워두는 게 정답이다.**

     | 버킷 | 판정 | `ctaUrl` | `ctaLabel` |
     |---|---|---|---|
     | A. 장소 여러 곳 | 카페/맛집 N곳 등 장소 목록 | 그 목록의 저장리스트 트래킹링크 | `소개된 곳 모아보기` |
     | B. 장소 1곳 | 단일 공간 심층 소개 | 비움 | 비움 |
     | C. 장소가 아닌 정보 | 제도·절차·가이드 | 그 글 카테고리의 `articles_cta_<slug>` 링크 | 비움 |

     - **A 버킷인데 저장리스트가 없으면 비워둔다** (홈 폴백). 나중에 저장리스트가 생기면 이 두 칸만 채우면 되고
       코드 배포가 필요 없다. 저장리스트 발급은 `/scc-create-content-list-type`이 담당하고, **그 스킬이 이미
       트래킹링크를 알고 있으므로 `slug`와 함께 이 두 칸도 그 스킬이 미리 배정한다** — 이 스킬은 비어 있으면 그대로 둔다.
     - 이미 값이 있으면 **재생성 금지**(`slug`와 같은 이유 — 유입 리포트가 어긋난다).
     - 본문 안에 이미 저장리스트 링크(`link.staircrusher.club/<region>_save`)가 있으면 그것을 쓴다. 주의: 같은
       도메인의 `_kakao`/`_app`/`_donation`/`alone` 링크는 저장리스트가 **아니다**.
     - C 버킷용 카테고리 링크는 필요한 것만 발급되어 있다(현재 `articles_cta_transit`). 없는 카테고리면
       비워두고(홈 폴백) 링크를 먼저 발급한다.
3. MCP `notion-update-page`로 해당 프로퍼티를 **DB에 라이트백**(캐싱 + 사람이 검토·수정 가능).

> **★ faq 라이트백 함정 (MCP)**: `API-patch-page`는 rich_text `content`가 그 자체로 유효한 JSON(맨 앞 `[`/`{`)이면 자동 파싱 후 "should be a string"으로 **거부**한다. 그래서 faq JSON 배열은 그대로 못 쓴다. **해결**: content 앞에 **zero-width space(`​`)를 붙여** 문자열로 저장한다(예: `"​[{\"q\":...}]"`). 빌드가 `build-articles.js`에서 앞쪽 공백/zero-width를 strip 후 `JSON.parse`하므로 정상 복원된다. (병렬 작성 시 인코딩 통일 필수 — prose로 쓰면 FAQPage 스키마 누락.)

> **★ write-back 시계 함정**: 라이트백은 `last_edited_time`을 올린다. 그래서 STEP 2(라이트백) → STEP 3(빌드, DB 재쿼리) 순서를 지키면, 빌드가 라이트백 **이후**의 시각을 manifest에 저장한다. 다음 실행 땐 사람이 본문을 또 고치지 않는 한 시각이 같아 **스킵**된다. 순서를 어기면 매번 재처리되니 주의.

### STEP 3 — 결정론적 빌드 (본문→HTML, 무LLM)
```bash
NOTION_TOKEN=... node scripts/build-articles.js --db <database_id>
```
- 변경분만 블록 fetch + 이미지 다운로드(presigned 만료 대응 — 로컬 에셋으로 커밋) + HTML 생성.
- `web-articles/{slug}/`(커밋본)과 `web-dist/articles/`(배포용) + 목록/sitemap/robots/llms 동시 갱신.
- **빌드 후 에셋 유실을 반드시 확인한다** — `git status --porcelain web-articles | grep '^ D'` 가 비어야 커밋한다. 빌드 로그의 `⚠️ 다운로드 실패` / `♻️ 기존 에셋 유지` 도 함께 읽는다. (사고: `--force` 재빌드가 콜아웃 아이콘 2개를 prod 에서 지웠다. 지금은 `reuseExistingAsset` 가 막지만, 새 에셋 경로를 추가하면 이 확인이 유일한 그물이다.)
- **렌더러/템플릿을 고쳤으면 `--force`(전체) 대신 `--only a,b,c`로 단계적 롤아웃**을 고려한다. 지정 slug만 재생성하고 나머지는 커밋된 HTML 그대로 두므로, 39개 전체를 한 번에 갈아엎지 않고 최근 글부터 검증할 수 있다. (`--only`에 DB에 없는 slug를 주면 경고를 찍는다.)
- **`--offline` 은 템플릿을 안 탄다**(커밋된 HTML 복사만) → `--force`/`--only` 와의 조합은 스크립트가 거부한다. 템플릿 수정 반영은 로그가 아니라 산출물 grep 으로 판정한다: `grep -rl '<마커>' web-articles/ | wc -l` 이 상세페이지 수와 같아야 한다.
- **Notion 붙은 빌드 전에 `--dry`**: `신규/변경 0` 이어야 남의 Notion 편집이 함께 발행되지 않는다.

### STEP 4 — 시각 검증 (E2E)
```bash
npx serve web-dist -l 5050      # `-s` 금지: SPA 폴백이 /articles/<slug>를 /login으로 가로챈다
```
- Playwright/브라우저로 `/articles`, 변경된 `/articles/{slug}` 접속 → callout/toggle/이미지/표가 정상인지 확인.
- HTML 소스에 title/description/canonical/OG/JSON-LD 존재 확인. [Google Rich Results Test]로 Article/FAQPage 검증.
- **전 페이지 자동 스윕(MANDATORY)** — 눈으로 몇 개만 보면 놓친다. `/articles`에 접속한 뒤 sitemap의 전 URL을 420px iframe에 순차 로드해 한 번에 판정한다(같은 origin이라 `contentDocument` 접근 가능). 실제로 이 스윕이 표 가로넘침·유실된 tab 본문·생 URL 앵커 3건을 잡았다:
  ```js
  // 판정: scrollWidth > clientWidth(가로 넘침) / naturalWidth===0(깨진 이미지) /
  //       앵커 텍스트가 생 URL / article 텍스트 길이 200자 미만(본문 유실) /
  //       외부 절대 URL 앵커에 target="_blank" 누락 · 내부(/,#) 앵커에 target="_blank" 오부착
  ```
- 같은 스윕을 STEP 6 배포 후 prod origin에서 한 번 더 돌린다(캐시·리라이트까지 포함해 검증).

### STEP 5 — 커밋 + PR
- **먼저 브랜치를 확인한다.** 발행 작업은 무관한 feature 브랜치 위에서 시작되기 십상이다(`git branch --show-current`). `git fetch origin main && git checkout -b <branch> origin/main`으로 분기하면 워킹트리의 발행본은 그대로 따라온다(`web-articles/`·`scripts/`는 보통 feature 브랜치와 겹치지 않음).
- `web-articles/`(manifest + 생성 HTML + 에셋)를 커밋&푸시. (`web-dist/`는 gitignore라 커밋 안 됨)
- `gh pr create --base main`으로 PR 생성.

### STEP 6 — prod 배포 (MANDATORY)
**발행 요청 = prod 배포 요청이다.** "노션 글 발행해줘"/"아티클 올려줘"류 요청은 STEP 6까지 완주한다 — 커밋에서 멈추고 "배포할까요?"라고 되묻지 않는다. 발행됐는데 prod에 없으면 검색 유입이 0이라 이 스킬의 목적 자체가 달성되지 않는다. (글로벌 CLAUDE.md의 "배포는 명시 요청만" 규칙보다 이 항목이 우선 — 여기서의 명시 요청은 '발행' 그 자체다.)

**순서 필수** — `web-deploy.sh`는 `--delete` sync라 web-dist에 SPA+bbucle+articles가 **모두** 있어야 기존 사이트가 안 지워진다:
```bash
# git reset --hard 금지 — 커밋 안 한 web-articles 발행본을 날린다. 워킹트리 그대로 빌드.
yarn web:build                                   # ① SPA + bbucle prerender + sitemap + articles(--offline 재조립)
NOTION_TOKEN=... node scripts/build-articles.js --db <id>   # ② articles를 web-dist에 다시 채움 + sitemap 머지
npx serve web-dist -l 5052                       # ③ 로컬 확인 (MANDATORY). `-s`는 금지 —
                                                 #    SPA 폴백이 /articles/<slug>를 가로채 /login으로 보낸다
aws-vault exec swann-scc -- ./web-deploy.sh       # ④ S3 sync + CloudFront 무효화
```
- ③에서 SPA·bbucle·articles 3개 표면이 **모두** 살아있는지 확인 후에만 ④로 간다(`--delete` sync라 빠진 표면은 prod에서 삭제됨):
  ```bash
  curl -s localhost:5052/ -o /dev/null -w '%{http_code}\n'                    # SPA
  curl -s localhost:5052/bbucle-road/kspo-dome/ -o /dev/null -w '%{http_code}\n'  # bbucle
  curl -s localhost:5052/articles/<slug> | grep -c '<제목 일부>'                # articles
  ```
- ④의 끝에 나오는 `terraform output ... No outputs found` 경고는 로컬 tf state가 없어서 나는 것 — **배포 실패 아님**. 실제 성공 여부는 아래 curl로 판정한다.
- 배포 후 검증:
  ```bash
  curl -A "Googlebot" https://web.staircrusher.club/articles/<slug>   # 정적 본문 반환
  curl -A "Mozilla"  https://web.staircrusher.club/articles/<slug>   # 사람도 동일 (Lambda 리라이트)
  ```
- 캐시로 안 보이면 하드 리프레시(`Cmd+Shift+R`) / Playwright는 새 컨텍스트.
- Google Search Console에 sitemap 제출(`https://web.staircrusher.club/sitemap.xml`).

### STEP 7 — main 머지 (MANDATORY, 여기까지가 발행이다)
prod S3에는 나갔는데 `web-articles/` 커밋본이 브랜치에만 있으면, **다음 사람이 main 기준으로 재빌드하는 순간 이번 발행분이 통째로 사라진다**(`--delete` sync). 배포와 머지는 한 세트다 — PR만 만들고 멈추지 않는다.

```bash
gh pr merge <번호> --squash --admin --delete-branch
```
- **`--admin` 필요** — 브랜치 보호가 `REVIEW_REQUIRED`라 리뷰어 없이는 `mergeStateStatus: BLOCKED`로 막힌다. 자기 PR은 self-approve가 안 되므로 admin 머지로 완주한다(CI `build`/CodeRabbit은 통과 확인 후).
- **main push = sandbox OTA 배포 트리거**(`cd-sandbox.yml`). 정상 동작이니 놀라지 말 것.
- **prod 앱 홈의 콘텐츠 섹션 반영에는 prod OTA(`v*` 태그, `cd-production.yml`)가 필요하다** — 앱 홈 `ArticleSection`이 번들에 포함된 `web-articles/manifest.json`을 읽기 때문(`src/utils/articles.ts`). 웹(`web.staircrusher.club`)은 STEP 6 배포로 이미 반영되지만 **prod 앱 홈은 아니다**. 발행 완료 보고에 "앱 홈에도 반영하려면 prod OTA가 필요하다"를 한 줄 포함하고, 사용자가 명시 요청하면 `/scc-app-release` 절차로 태그를 단다. **태그 자동 생성 금지**(배포 = 명시 요청만, H4 hook).
- 머지 후 `gh run list --branch main`으로 OTA Deployment가 도는지만 확인하면 끝.

## 블록 렌더링 & 디자인 충실도 (Notion ↔ article 1:1)

빌드 STEP 3 후 **모든 article을 Notion 원본과 시각 대조**한다(STEP 4). 새 글은 기존 글이 안 쓰던 블록을 쓸 수 있고, `renderBlock`의 `default`는 본문을 **버린다**(`⚠️ 미지원 블록(스킵)` 로그 필수 확인). 지금까지 처리한 것:

- **`child_database` (인라인 DB) — row 본문 유무로 3분기** (`renderChildDatabase`). 핵심 콘텐츠가 프로퍼티에 있는지/row 하위 페이지 본문에 있는지 반드시 확인(`get-block-children`으로 row 본문 샘플). 안 하면 통째로 유실된다:
  1. **본문 없음(프로퍼티형)**: 흑백/BTS/전국-표 등 → 가로 스크롤 **표**(select/multi_select는 Notion 색 pill).
  2. **본문=사진만(image-only)**: goyang/kspo/nationwide → 표 + row별 **사진 썸네일 컬럼** 인라인(얇은 상세 페이지 안 만듦).
  3. **본문=리치(heading/callout/텍스트)**: diaspora/콜택시-지역별 → row별 **독립 상세 페이지 발행**(`/articles/<parent>/<rowSlug>/`) + 부모는 **링크 카드/링크 표**(Notion "카드 클릭→상세" 모방). 상세 slug/summary는 `web-articles/subpages.json`(rowId→메타)에 LLM으로 생성해 커밋(STEP 2b). sitemap 포함, 목록엔 미노출.
  - **컬럼 순서**: 공식 API가 뷰 순서를 안 줌 → `COLUMN_ORDER` 맵(블록 id→컬럼 배열), 새 DB는 갱신. 뷰 순서는 DB public 페이지 `.notion-table-view-header-cell`로 확인.
  - **DB 제목은 표 위** — 인라인 DB 제목은 `<figcaption>`(표 하단)이 아니라 표 위 `<p class="db-title">`로. (Notion 인라인 DB 디자인)
  - **표 셀은 wrap** — `.db-wrap table`에 `white-space:nowrap` 금지(모든 셀 1줄 강제 → 무한 가로 스크롤). `white-space:normal;word-break:keep-all;overflow-wrap:anywhere`로 한글 단어 유지하며 컨테이너 폭에 맞춰 줄바꿈. 표 셀 shift+enter는 아래 `\n`→`<br>` 규칙으로 해결됨.
- **하위 블록 재귀 필수** — `paragraph`·`to_do`도 `has_children`면 하위를 렌더해야 한다. 안 하면 **문단 하위 섹션·중첩 체크리스트가 통째로 유실**(nationwide '추가 정보' 섹션, 전동휠체어 준비물 6항목 실제 사고).
- **`tab` 블록 하위 렌더** — 탭 컨테이너는 API가 `tab: {}`(텍스트 없음)로 준다. 하위를 펼치지 않으면 탭 안 본문이 통째로 유실(애관극장 상영관 시야 3섹션 실제 사고).
- **네이티브 `table`도 `.tbl-wrap`으로 감쌀 것** — 인라인 DB 표(`.db-wrap`)와 달리 `table` 블록은 감싸는 컨테이너가 없으면 **페이지 전체가 가로 스크롤**된다. 생 URL 앵커도 같은 증상 → `article a{overflow-wrap:anywhere}`. STEP 4에서 전 페이지 `scrollWidth > clientWidth` 전수 체크로 잡는다.
- **컬러 callout/블록** — callout `color`=배경(`default_background`→Notion 기본 회색 `#f1f1ef`), paragraph/heading 블록 `color`도 반영(`colorStyle`). 인라인 span 색/밑줄은 `renderRich`.
- **callout 아이콘은 Notion 원본대로**(`renderCalloutIcon`) — `emoji`는 그대로; 빌트인(`type:"icon"`, 예 cursor-click)은 `https://www.notion.so/icons/{name}_{color}.svg` 다운로드; external/file/custom_emoji는 그 URL 다운로드; **`icon:null`이면 아이콘 없음(💡 강제 금지)**. 💡 폴백으로 뭉개면 커스텀 디자인이 다 죽는다(실제 지적).
- **줄바꿈(shift+enter) 보존** — Notion rich_text `plain_text`의 `\n`은 HTML에서 공백으로 붕괴 → `renderRich`에서 `\n`→`<br>`. 표 셀(`renderPropValue`→`renderRich`)에도 적용됨.
- **빈 줄(empty line) 보존** — 내용·하위블록 없는 빈 `paragraph`도 `<p class="empty">`(높이 1em)로 유지. 버리면 의도된 줄간격이 뭉개져 다닥다닥 붙는다.
- **이미지 표시 폭/정렬은 비공식 v3 API로 반영**(`fetchImageLayout`) — 공식 API 이미지 블록은 caption/file만 주고 표시 폭/정렬을 **안 준다**. Notion 비공식 `POST https://www.notion.so/api/v3/loadPageChunk`(공개 페이지는 **무인증 200**, Oopy가 쓰는 그 데이터)의 `recordMap.block[id].value.value.format`에서 `block_width`(px)·`block_alignment`·`block_full_width`를 페이지 단위로 수집(`ctx.imgLayout`, blockId=하이픈 UUID로 매칭). image 렌더에서 full이면 100%, 아니면 `max-width:{block_width}px` + align(center=margin auto/right). 페이지가 비공개면 무데이터 → 자연 크기 폴백. (공식 API "불가능"으로 착각 금지 — 실제 지적받음.)
- **heading 토글** — `is_toggleable`면 `<details>`(하위 블록 유실 방지). 모든 heading에 `id`(=블록id no-hyphen) 부여.
- **`table_of_contents` + 앵커** — heading id 기반 목차 nav 렌더. 인페이지 `#블록id` 링크는 `fixHref`가 `#no-hyphen`으로 remap.
- **내부 링크 remap(`fixHref`)** — Notion 페이지-id 경로(`/d490…`)·노션 도메인은 죽은 링크 → `LINK_MAP`(발행된 글/상세 URL) 있으면 그리로, 없으면 `/articles`. ("뒤로가기" 등 전 글의 dead link 제거.)
- **외부 링크는 새 탭(`linkAttrs`)** — 본문/북마크/파일/표 셀의 외부 절대 URL은 `target="_blank" rel="noopener noreferrer"`. 안 하면 카카오톡·저장리스트·예매 같은 CTA를 누르는 순간 읽던 글에서 튕겨나간다(실제 지적). **같은 사이트 경로(`/articles/…`)와 인페이지 앵커(`#`)에는 붙이지 않는다** — 사이트 내 이동까지 새 탭이면 탭이 쌓인다. 앵커를 새로 렌더하는 코드를 추가하면 `rel="noopener"` 하드코딩 대신 반드시 `linkAttrs(href)`를 통과시킬 것.
- **이미지 가드** — 트래킹 픽셀(seeyoufarm)·비-http(`file:`) 스킵.
- **fetch 타임아웃/재시도(`fetchWithTimeout`)** — 무타임아웃 fetch는 stalled 연결(만료 presigned 등)에서 **빌드 무한 hang**. 25~30s 타임아웃 + 재시도 + 429 백오프 필수.
- **불가피**: Notion API가 `type:"unsupported"`로 주는 블록(button 등)은 콘텐츠가 없어 렌더 불가 — 기록만.

## AEO/GEO 체크리스트 (생성기/메타에 반영됨)
- ✅ 정적 본문이 초기 HTML에 텍스트로 존재(JS 의존 0) — LLM 크롤러가 읽음
- ✅ 리드 요약(직접답변) + FAQ → `FAQPage` JSON-LD
- ✅ `Article` JSON-LD(author/publisher=계단뿌셔클럽, datePublished)
- ✅ canonical=자기 자신, OG/Twitter 카드
- ✅ `robots.txt`에 GPTBot/ClaudeBot/PerplexityBot/Google-Extended **허용**, `/llms.txt` 글 인덱스
- ✅ 엔티티 일관성(계단뿌셔클럽 브랜드/용어), sitemap 등록

## 범위 밖 (다음 페이즈)
- **저장 → 로그인 유도**: 백엔드(scc-api/server) 저장 API + 웹 로그인 플로우 필요. 크로스레포라 `/scc-feature`로 별도 진행. (템플릿에 `<!-- TODO -->` 자리만 둠)
