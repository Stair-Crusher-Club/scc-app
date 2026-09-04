---
name: scc-app-release
description: SCC 앱 OTA 배포 + 웹 배포 절차. "OTA 배포해줘", "앱 출시", "웹 배포", "web-deploy", "프로덕션에 올려줘" 같은 명시적 배포 요청 시에만 사용. 배포는 one-way door — 이 skill의 절차를 벗어나 임의로 배포하지 않는다.
---

# SCC App Release — OTA / 웹 배포

## 배포 표면은 4개고 서로 독립이다 (제일 먼저 볼 것)

**하나를 배포해도 나머지엔 아무 일도 일어나지 않는다.** "배포해줘"를 받으면 이 표에서 이번 변경이 닿는 표면을 **전부 고르고 전부 완주**한다. 한 표면만 하고 "배포 완료"라고 보고하지 않는다.

| 표면 | 트리거 | 안 하면 |
|---|---|---|
| prod 앱 | `v*` 태그 push | 앱스토어 사용자에게 안 나감 |
| sandbox 앱 | `main` push (자동) | 사내 테스트 앱에 안 나감 |
| **웹 `web.staircrusher.club`** | **로컬 수동** `yarn web:build` + `web-deploy.sh` (**CI 없음**) | 웹은 옛 번들 그대로 — OTA는 여기 안 닿는다 |
| 원격 에셋 (`web-articles/**/assets`) | S3 업로드 | 앱/웹이 404를 받는다 |

- `src/` 화면 변경은 **네이티브 앱과 웹이 같은 코드를 쓴다**(`/home` = `MainScreen.tsx` → `HomeScreenV2`, 웹 전용 홈 없음). 즉 화면을 고치면 **앱 OTA와 웹 배포가 둘 다 필요**하다. OTA만 하고 끝내는 것이 반복된 실수다. (2026-08-07)
- **원격 에셋은 앱/웹보다 먼저 올린다.** 앱이 참조하는 URL이 아직 404면 배포해도 이미지가 안 뜨고, 그 전에 로컬 테스트조차 못 한다.

### 에셋만 먼저 올리기 (전체 웹 배포와 분리)

전체 배포는 `--delete` sync라 web-dist 전체가 필요하지만, **신규 에셋 추가는 additive 업로드로 분리**할 수 있다. 기존 사이트를 안 건드리므로 골든패스 없이 즉시 가능하고, 이걸 먼저 해야 로컬에서 앱을 테스트할 수 있다:

```bash
cd scc-app
aws-vault exec swann-scc -- aws s3 sync web-articles/ s3://staircrusher-club-web/articles/ \
  --exclude "*" --include "*/assets/thumb-0.webp" --content-type "image/webp"   # --delete 금지
curl -s -o /dev/null -w '%{content_type}\n' https://web.staircrusher.club/articles/<slug>/assets/thumb-0.webp
```

- **`--delete`를 절대 붙이지 않는다** — 붙이면 `articles/` 아래 나머지가 다 지워진다.
- **신규 추가 vs 내용 교체는 처리가 다르다.** 없던 경로를 새로 올리는 것이면 CloudFront에 캐시될 게 없어 무효화가 불필요하다. 하지만 **같은 경로의 내용을 바꾸면 무효화가 필수**다(에셋엔 `no-cache`가 안 붙는다 — `web-deploy.sh`는 HTML/bundle.js에만 붙인다):
  ```bash
  aws-vault exec swann-scc -- aws cloudfront create-invalidation \
    --distribution-id E3RDKBHB12EC6A --paths "/articles/*"
  ```
  판정은 로컬 파일과 prod 응답의 **md5 대조**로 한다 — 200/`content_type`만으로는 옛 바이트가 오는 걸 못 잡는다. 앱에서도 FastImage 캐시를 지워야 새 바이트가 보인다(위 함정 참조).
- Lambda@Edge(`seo-handler.js`)는 `uri.includes('.')`면 리라이트 없이 통과시키므로 확장자 있는 에셋은 그냥 서빙된다.
- **판정은 `%{http_code}`가 아니라 `%{content_type}`으로 한다.** 없는 경로도 SPA fallback HTML을 **200**으로 돌려주므로 200은 존재의 증거가 아니다.

### 함정: FastImage 디스크 캐시가 "실패 응답"을 캐싱한다

에셋 배포 **전에** 앱이 그 URL을 한 번이라도 요청했으면, 200 HTML fallback이 URL 키로 디스크 캐시에 남아 **배포 후에도 계속 회색 placeholder**가 뜬다. 앱 코드/배포를 의심하기 전에 캐시부터 지운다:

```bash
adb shell run-as club.staircrusher.sandbox rm -rf cache/image_manager_disk_cache cache/image_cache cache/http-cache
adb shell am force-stop club.staircrusher.sandbox   # 이후 재실행
```
(`pm clear`는 앱 데이터까지 날려 로그아웃되므로 캐시 디렉토리만 지운다.)

## OTA 배포 규칙 (MANDATORY)

- **sandbox 배포 = 태그 없이 `main` push** (`.github/workflows/cd-sandbox.yml`, "OTA Deployment" → `ota-deploy:sandbox`). "sandbox 배포", "샌드박스에서 테스트", 그냥 "main push 해" = 태그 만들지 말고 `git push origin main`만.
- **prod 배포 = `v*` 태그 push** (`cd-production.yml`, "Production OTA Deployment"). 태그 형식 `v{major}.{minor}-YYYYMMDD-NN`. **`v*` 태그는 prod 배포다 — sandbox 요청에 절대 태그를 만들지 않는다.**
- **`ota-deploy` 수동 실행 금지.** 위 트리거로 GitHub Actions가 자동 실행한다.
- **네이티브 앱 릴리스 = `release-1.3.x` 브랜치.** 이 브랜치가 곧 `main`으로 가는 통합/PR 브랜치다 — 수정은 이 브랜치 위에 얹고 **`release-1.3.x → main` 단일 PR**로 머지한다. 별도 `fix/*` 브랜치를 파서 main으로 PR하지 않는다. `release-*` push = Native Build Deployment(sandbox 앱 네이티브 빌드) 자동 트리거이므로 "release 브랜치 push" 지시는 빌드 지시와 동치.
- prod 배포 절차: 코드 변경 → lint/tsc 통과 → 커밋 → `v*` 태그 → 태그 push (자동 배포). prod는 태그 없이 푸시하지 않는다.
- git push/tag는 사용자가 명시적으로 요청한 것만 실행한다 (태그 생성/push는 hook이 ask로 가로챈다). 헷갈리면 워크플로우의 `on: push: branches/tags`를 직접 확인할 것.

## 웹 배포 규칙

- **웹 배포는 로컬에서 수동 실행한다.** (CI 워크플로우 없음)
- **모든 배포는 `origin/main` 기준이다 (H19 hook이 차단).** 배포 직전 `git fetch origin main && git rev-parse HEAD origin/main`이 동일해야 하고 추적 파일에 미커밋 변경이 없어야 한다. 로컬 커밋 상태로 배포하면 prod에 뭐가 떴는지 git으로 되짚을 수 없고 롤백 기준도 사라진다. **sandbox 배포 = 무조건 main merge** — 브랜치에서 바로 배포하지 않는다.
- 배포 절차:
  1. **origin/main == HEAD 확인 후, 그 상태의 워킹트리로 빌드**(web-articles 발행본은 먼저 커밋해 main에 올린다). `git reset --hard`는 쓰지 않는다 — 커밋 안 한 발행본/렌더러 수정을 날린다. main 최신 반영은 `git fetch origin main && git rebase origin/main`로 비파괴적으로.
  2. `yarn web:build` (production 빌드 → `web-dist/`)
     - 내부적으로 `ENVFILE=subprojects/scc-frontend-build-configurations/production/.env`가 강제되어 `BASE_URL=https://api.staircrusher.club`가 bake 된다.
     - `ENVFILE=.env.local` 같이 native dev용 env 로 빌드하면 `BASE_URL=10.0.2.2:8080`이 박혀 일반 브라우저에서 닿지 못한다. 절대 그렇게 빌드하지 말 것.
  3. **빌드 후 3개 표면 골든패스 테스트 필수 (MANDATORY)** — 아래 "웹 골든패스" 참조. 하나라도 실패하면 배포 금지.
  4. `aws-vault exec swann-scc -- ./web-deploy.sh` (S3 업로드 + CloudFront 무효화)
  5. 배포 후 prod URL 에서 3개 표면 재확인 (curl 로 HTML 마커 검증 — 브라우저 캐시 우회).

### 웹 골든패스 (배포 전/후 필수) — web.staircrusher.club 은 표면 3개가 각각 다르게 구현·서빙된다

빌드 산출물(`web-dist/`)을 정적 서버로 띄우고(포트 충돌 피해 빈 포트 사용), 표면별로 각각 검증한다. **"타입체크/린트 통과"·"한 페이지만 확인"은 골든패스가 아니다** — 3개 다 봐야 한다.

| 표면 | 경로 예 | 구현/서빙 | 검증 (실패=배포 금지) |
|------|---------|-----------|----------------------|
| ① 메인 앱(SPA) | `/`, `/login` | react-native-web, `#root`+`bundle.js` | SPA 부팅, 콘솔 에러 0 |
| ② 뿌클로드(prerender→SPA) | `/bbucle-road/`, `/bbucle-road/<slug>/` | prerender HTML(`#root`+`bundle.js`)로 부팅 | 실제 콘텐츠 렌더, **`Child compilation failed`/`Invalid or unexpected token` 없음**, 콘솔 에러 0 |
| ③ 아티클(정적) | `/articles/<slug>/` | **순수 정적 HTML**(`<article>`, bundle.js 없음) | 정적 콘텐츠 렌더 |

- **포트 스쿼터 함정 (검증 전 필수)**: 다른 clone(`scc-workspace-2`)/세션이 같은 포트에 `serve`를 띄워두면, 내 `serve`는 조용히 실패하고 **curl이 남의 `web-dist`를 검증한다** — 골든패스가 통째로 무효가 된다. 띄우기 전에 `lsof -iTCP:<port> -sTCP:LISTEN -n -P`로 비었는지 확인하고, 점유 중이면 **kill하지 말고**(H1) 빈 포트를 쓴다. (2026-08-07: 5052 점유를 모르고 통과 판정)
- **Chrome 차단 포트 함정**: 5060/5061 같은 포트는 Chrome 이 `ERR_UNSAFE_PORT` 로 거부해 **Playwright 검증이 아예 시작도 못 한다** — `curl` 은 정상 응답하므로 서버는 멀쩡해 보이고 브라우저만 막힌다. 골든패스용 포트는 5070+ 처럼 안전 대역에서 고른다. (2026-09-04 실측)
- **정적 서버 함정**: `serve web-dist -s`(SPA 모드)는 `/articles/<slug>/` 디렉토리 요청을 루트 SPA 로 rewrite 해 아티클을 못 띄운다. 아티클(③)은 `-s` **없이** 서빙하거나 파일/curl 로 직접 확인한다(prod 는 S3 디렉토리 인덱스로 정적 서빙). ①②(클라 라우팅)는 `-s` 로.
- 검증은 Playwright 렌더 + `browser_console_messages` 로 콘솔 에러 확인, 그리고 `curl <url> | grep -E 'Child compilation failed|Invalid or unexpected|id="root"'` 로 HTML 마커까지 본다.
- 인프라: S3 버킷 `staircrusher-club-web` + CloudFront `E3RDKBHB12EC6A`
- 프로덕션 URL: `https://d2casvwkfuypye.cloudfront.net`
- CloudFront 전파에 최대 15분 소요
- **OG prerender 포트 함정**: `generate-og-pages.js`는 빈 포트에 serve 를 띄우고 `id="root"` 마커로 우리 산출물인지 확인한 뒤 스크랩한다(2026-07 이전 버전은 하드코딩 3099 가 점유돼 있으면 스쿼터의 webpack 에러 페이지를 스크랩해 `bbucle-road/*/index.html`에 배포하는 사고가 있었다). 산출물에 `id="root"`가 없으면 스크립트가 빌드를 실패시킨다 — 이 실패는 무시하지 말 것. 또한 **클라이언트 전용 오버레이/모달(로그인 유도 팝업 등)은 prerender 스냅샷에 박제되면 초기 페인트에 잠깐 떴다 hydration 으로 사라지는 깜빡임**을 유발하므로 `data-*` 마커를 달아 `page.content()` 직전에 제거한다(`data-scc-daily-login-prompt` 사례). web 오버레이는 `document.body` 직속 append 말고 **React 트리(#root 내부)에서 렌더**할 것 — body 직속은 prod 라이브 스크립트의 body 조작에 핸들러가 소실된다(로컬 mock 이라 재현 안 됨).
- **지도 관련 기능은 port 3000에서 테스트해야 함** (네이버 지도 API 키가 localhost:3000에 바인딩)
- **번들 캐시 (중요)**: `bundle.js`·HTML 은 파일명이 고정이라, Cache-Control 이 없으면 브라우저가 heuristic 캐시로 옛 번들을 계속 물어 배포가 반영 안 된다(사고 사례: 옛 popup 번들이 남아 버튼이 안 먹는 것처럼 보임). `web-deploy.sh` 가 이 진입 파일들에 `Cache-Control: no-cache` 를 강제해 매 접속 재검증하게 한다 — 이 재설정 단계를 지우지 말 것. CloudFront invalidation 은 edge 만 비우고 브라우저 캐시는 못 비운다.
- **배포 후 검증 시 캐시 문제는 하드 리프레시로.** 그래도 옛 동작이 보이면 `Cmd+Shift+R`(Mac)/`Ctrl+Shift+R`. Playwright 는 HTTP 디스크 캐시가 끈질기다 — `?cb=` query 로는 script src(`/bundle.js`) 를 못 바꾼다. `fetch('/bundle.js',{cache:'reload'})` 후 reload 해도 script-tag 로드는 옛 것을 쓸 수 있으니, **prod 검증은 `curl`로 HTML/번들 마커를 보거나 md5 를 로컬 산출물과 대조**하는 게 가장 확실하다(브라우저 렌더는 stale 가능).

### 인프라 정보

- S3 버킷 `staircrusher-club-web` + CloudFront `E3RDKBHB12EC6A`
- 프로덕션 URL: `https://d2casvwkfuypye.cloudfront.net`
- CloudFront 전파에 최대 15분 소요
- **OG prerender 포트 함정**: `generate-og-pages.js`는 빈 포트에 serve 를 띄우고 `id="root"` 마커로 우리 산출물인지 확인한 뒤 스크랩한다(2026-07 이전 버전은 하드코딩 3099 가 점유돼 있으면 스쿼터의 webpack 에러 페이지를 스크랩해 `bbucle-road/*/index.html`에 배포하는 사고가 있었다). 산출물에 `id="root"`가 없으면 스크립트가 빌드를 실패시킨다 — 이 실패는 무시하지 말 것. 또한 **클라이언트 전용 오버레이/모달(로그인 유도 팝업 등)은 prerender 스냅샷에 박제되면 초기 페인트에 잠깐 떴다 hydration 으로 사라지는 깜빡임**을 유발하므로 `data-*` 마커를 달아 `page.content()` 직전에 제거한다(`data-scc-daily-login-prompt` 사례). web 오버레이는 `document.body` 직속 append 말고 **React 트리(#root 내부)에서 렌더**할 것 — body 직속은 prod 라이브 스크립트의 body 조작에 핸들러가 소실된다(로컬 mock 이라 재현 안 됨).
- **지도 관련 기능은 port 3000에서 테스트해야 함** (네이버 지도 API 키가 localhost:3000에 바인딩)

### 배포 후 검증 — 캐시 문제는 하드 리프레시로 해결

배포 후 production URL에서 변경 사항이 안 보일 때(번들이 분명 새로 올라갔는데도 옛 동작이 보일 때) 99%는 브라우저 캐시 문제다.

- `Cmd+Shift+R` (Mac) / `Ctrl+Shift+R` (Win/Linux)로 하드 리프레시하면 즉시 해결
- CloudFront invalidation은 이미 deploy 스크립트가 처리하므로 추가로 기다릴 필요 없음
- Playwright로 검증할 때는 query string cache buster(`?cb=...`)만으로는 부족 — `browser_close` 후 새 컨텍스트로 재진입하거나 `bypass cache` 옵션 필요
- 사용자가 "안 보인다"고 보고할 때도 먼저 하드 리프레시를 안내한다
