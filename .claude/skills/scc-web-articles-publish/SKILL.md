---
name: scc-web-articles-publish
description: Notion에 작성한 콘텐츠를 web.staircrusher.club/articles 정적 페이지로 발행해 검색엔진(SEO) + AI답변엔진(AEO/GEO)에 노출시킨다. "노션 글 발행해줘", "아티클 올려줘", "articles 갱신", "노션 콘텐츠 검색에 걸리게", "article list DB 렌더링" 같은 요청 시 사용. 사람은 Notion에 제목+본문만 쓰고, 이 스킬이 메타데이터(slug/summary/ogImage/tags/faq)를 LLM으로 생성해 DB에 라이트백한 뒤, 결정론적 노드 스크립트로 본문을 HTML로 변환한다. last_edited_time 기반 incremental — 신규/변경/삭제 문서만 처리해 토큰을 아낀다.
---

# SCC Web Articles Publish — Notion → web.staircrusher.club/articles

## 목적

팀이 Notion으로 만든 콘텐츠는 Notion publish로는 **검색에 안 걸려 신규 유입이 0**이다. 이 스킬은 그 콘텐츠를 우리 도메인(`web.staircrusher.club/articles`)의 **완전 정적 HTML**로 발행해 SEO + AEO/GEO 유입을 만든다.

- iframe 아님(`X-Frame-Options`로 막히고 SEO 크레딧이 notion으로 샘). **블록→HTML 1회 변환 후 정적 서빙**.
- 사람은 **제목+본문만** 작성. 나머지 메타는 스킬이 생성·DB 라이트백.
- 본문 변환은 **결정론적**(노드 스크립트, LLM 토큰 0). 메타 생성만 LLM, 그것도 **신규/변경분만**.

## 구성 요소 (이미 레포에 있음)

| 파일 | 역할 |
|------|------|
| `scripts/build-articles.js` | 결정론적 생성기: DB 쿼리 → incremental diff → 블록 fetch → 시맨틱 HTML + 이미지 다운로드 + manifest + sitemap/robots/llms |
| `scripts/article-template.js` | 자체 반응형 셸 + SEO 메타 + JSON-LD(Article/FAQPage). 480px SPA 프레임 안 탐 |
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
- **스킬이 생성해 DB에 라이트백**(머신 관리, 사람은 손 안 댐):
  - `slug` (rich_text) — 제목+내용 기반 URL id
  - `summary` (rich_text) — 검색 최적 한줄 요약 (meta description/리드 겸용)
  - `ogImage` (url, 선택) — 대표 이미지. 없으면 본문 첫 이미지 자동 사용
  - `tags` (multi_select, 선택)
  - `faq` (rich_text, 선택) — `[{"q":"...","a":"..."}]` JSON 문자열 → FAQPage 스키마
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
- "메타미비"(slug/summary 없음)로 잡힌 문서가 STEP 2에서 메타를 채워야 하는 신규 글이다.

### STEP 2 — 메타 생성 + DB 라이트백 (신규/변경분만, LLM)
변경된 각 문서에 대해:
1. 본문을 읽는다 — MCP `notion-fetch`(enhanced markdown)로 내용 파악.
2. **검색에 최대한 잘 걸리도록** 생성:
   - `slug`: 영문 kebab-case, 핵심 키워드 포함, 적절한 길이(과도하게 길지 않게).
   - `summary`: 1~2문장, 핵심 답변을 앞에. 검색 의도 키워드 자연 포함.
   - `ogImage`: 본문 내 대표 이미지 1개(없으면 비워둠 → 스크립트가 첫 이미지 사용).
   - `tags`: 2~5개.
   - `faq`: 본문에 Q&A 성격이 있으면 `[{"q","a"}]`로(AEO 핵심). 없으면 생략.
3. MCP `notion-update-page`로 해당 프로퍼티를 **DB에 라이트백**(캐싱 + 사람이 검토·수정 가능).

> **★ faq 라이트백 함정 (MCP)**: `API-patch-page`는 rich_text `content`가 그 자체로 유효한 JSON(맨 앞 `[`/`{`)이면 자동 파싱 후 "should be a string"으로 **거부**한다. 그래서 faq JSON 배열은 그대로 못 쓴다. **해결**: content 앞에 **zero-width space(`​`)를 붙여** 문자열로 저장한다(예: `"​[{\"q\":...}]"`). 빌드가 `build-articles.js`에서 앞쪽 공백/zero-width를 strip 후 `JSON.parse`하므로 정상 복원된다. (병렬 작성 시 인코딩 통일 필수 — prose로 쓰면 FAQPage 스키마 누락.)

> **★ write-back 시계 함정**: 라이트백은 `last_edited_time`을 올린다. 그래서 STEP 2(라이트백) → STEP 3(빌드, DB 재쿼리) 순서를 지키면, 빌드가 라이트백 **이후**의 시각을 manifest에 저장한다. 다음 실행 땐 사람이 본문을 또 고치지 않는 한 시각이 같아 **스킵**된다. 순서를 어기면 매번 재처리되니 주의.

### STEP 3 — 결정론적 빌드 (본문→HTML, 무LLM)
```bash
NOTION_TOKEN=... node scripts/build-articles.js --db <database_id>
```
- 변경분만 블록 fetch + 이미지 다운로드(presigned 만료 대응 — 로컬 에셋으로 커밋) + HTML 생성.
- `web-articles/{slug}/`(커밋본)과 `web-dist/articles/`(배포용) + 목록/sitemap/robots/llms 동시 갱신.

### STEP 4 — 시각 검증 (E2E)
```bash
npx serve web-dist -s -l 5050
```
- Playwright/브라우저로 `/articles`, 변경된 `/articles/{slug}` 접속 → callout/toggle/이미지/표가 정상인지 확인.
- HTML 소스에 title/description/canonical/OG/JSON-LD 존재 확인. [Google Rich Results Test]로 Article/FAQPage 검증.

### STEP 5 — 커밋
- `web-articles/`(manifest + 생성 HTML + 에셋)를 커밋&푸시. (`web-dist/`는 gitignore라 커밋 안 됨)

### STEP 6 — 배포 (`/scc-app-release` 절차, 사용자 명시 요청 시에만)
**순서 필수** — `web-deploy.sh`는 `--delete` sync라 web-dist에 SPA+bbucle+articles가 **모두** 있어야 기존 사이트가 안 지워진다:
```bash
# git reset --hard 금지 — 커밋 안 한 web-articles 발행본을 날린다. 워킹트리 그대로 빌드.
yarn web:build                                   # ① SPA + bbucle prerender + sitemap + articles(--offline 재조립)
NOTION_TOKEN=... node scripts/build-articles.js --db <id>   # ② articles를 web-dist에 다시 채움 + sitemap 머지
npx serve web-dist -s                            # ③ 로컬 확인 (MANDATORY)
aws-vault exec swann-scc -- ./web-deploy.sh       # ④ S3 sync + CloudFront 무효화
```
- 배포 후 검증:
  ```bash
  curl -A "Googlebot" https://web.staircrusher.club/articles/<slug>   # 정적 본문 반환
  curl -A "Mozilla"  https://web.staircrusher.club/articles/<slug>   # 사람도 동일 (Lambda 리라이트)
  ```
- 캐시로 안 보이면 하드 리프레시(`Cmd+Shift+R`) / Playwright는 새 컨텍스트.
- Google Search Console에 sitemap 제출(`https://web.staircrusher.club/sitemap.xml`).

## 블록 렌더링 & 디자인 충실도 (Notion ↔ article 1:1)

빌드 STEP 3 후 **모든 article을 Notion 원본과 시각 대조**한다(STEP 4). 새 글은 기존 글이 안 쓰던 블록을 쓸 수 있고, `renderBlock`의 `default`는 본문을 **버린다**(`⚠️ 미지원 블록(스킵)` 로그 필수 확인). 지금까지 처리한 것:

- **`child_database` (인라인 DB)** — 뿌클로드 글의 핵심 콘텐츠(식당/장소/콜택시 목록)는 본문이 아니라 **인라인 DB의 row 프로퍼티**에 있다. 안 다루면 article이 텅 빈다. → `renderChildDatabase`가 `databases/{id}/query`로 row를 받아 **가로 스크롤 표**로 렌더(select/multi_select는 Notion 색 pill).
  - **컬럼 순서**: 공식 API는 인라인 **뷰의 컬럼 순서**를 안 준다(스키마 순서만). → `build-articles.js`의 **`COLUMN_ORDER` 맵**(child_database 블록 id → 컬럼명 배열)에 수동 지정. **새 DB 추가 시 맵 갱신 필수**(누락 시 폴백 + 경고 로그). 뷰 순서는 DB public 페이지(`agnica.notion.site/<id-no-hyphens>`)에서 `.notion-table-view-header-cell` innerText로 읽는다. 갤러리 뷰는 헤더셀이 없어 카드 필드 순서로 대체.
- **컬러 callout/블록** — callout `color`는 배경색 의미(`calloutBgStyle`), paragraph/heading 블록 `color`도 배경/글자색 반영(`colorStyle`). 인라인 span 색/밑줄은 `renderRich`가 이미 처리.
- **이미지 가드** — 트래킹 픽셀(seeyoufarm 등)·비-http(`file:` 첨부)는 스킵.
- **`table_of_contents`** — 평탄화 정적 페이지에선 앵커 점프 불가 → 생략.

## AEO/GEO 체크리스트 (생성기/메타에 반영됨)
- ✅ 정적 본문이 초기 HTML에 텍스트로 존재(JS 의존 0) — LLM 크롤러가 읽음
- ✅ 리드 요약(직접답변) + FAQ → `FAQPage` JSON-LD
- ✅ `Article` JSON-LD(author/publisher=계단뿌셔클럽, datePublished)
- ✅ canonical=자기 자신, OG/Twitter 카드
- ✅ `robots.txt`에 GPTBot/ClaudeBot/PerplexityBot/Google-Extended **허용**, `/llms.txt` 글 인덱스
- ✅ 엔티티 일관성(계단뿌셔클럽 브랜드/용어), sitemap 등록

## 범위 밖 (다음 페이즈)
- **저장 → 로그인 유도**: 백엔드(scc-api/server) 저장 API + 웹 로그인 플로우 필요. 크로스레포라 `/scc-feature`로 별도 진행. (템플릿에 `<!-- TODO -->` 자리만 둠)
