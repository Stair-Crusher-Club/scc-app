---
name: scc-app-release
description: SCC 앱 OTA 배포 + 웹 배포 절차. "OTA 배포해줘", "앱 출시", "웹 배포", "web-deploy", "프로덕션에 올려줘" 같은 명시적 배포 요청 시에만 사용. 배포는 one-way door — 이 skill의 절차를 벗어나 임의로 배포하지 않는다.
disable-model-invocation: true
---

# SCC App Release — OTA / 웹 배포

## OTA 배포 규칙 (MANDATORY)

- **sandbox 배포 = 태그 없이 `main` push** (`.github/workflows/cd-sandbox.yml`, "OTA Deployment" → `ota-deploy:sandbox`). "sandbox 배포", "샌드박스에서 테스트", 그냥 "main push 해" = 태그 만들지 말고 `git push origin main`만.
- **prod 배포 = `v*` 태그 push** (`cd-production.yml`, "Production OTA Deployment"). 태그 형식 `v{major}.{minor}-YYYYMMDD-NN`. **`v*` 태그는 prod 배포다 — sandbox 요청에 절대 태그를 만들지 않는다.**
- **`ota-deploy` 수동 실행 금지.** 위 트리거로 GitHub Actions가 자동 실행한다.
- **네이티브 앱 릴리스 = `release-1.3.x` 브랜치.** 이 브랜치가 곧 `main`으로 가는 통합/PR 브랜치다 — 수정은 이 브랜치 위에 얹고 **`release-1.3.x → main` 단일 PR**로 머지한다. 별도 `fix/*` 브랜치를 파서 main으로 PR하지 않는다. `release-*` push = Native Build Deployment(sandbox 앱 네이티브 빌드) 자동 트리거이므로 "release 브랜치 push" 지시는 빌드 지시와 동치.
- prod 배포 절차: 코드 변경 → lint/tsc 통과 → 커밋 → `v*` 태그 → 태그 push (자동 배포). prod는 태그 없이 푸시하지 않는다.
- git push/tag는 사용자가 명시적으로 요청한 것만 실행한다 (태그 생성/push는 hook이 ask로 가로챈다). 헷갈리면 워크플로우의 `on: push: branches/tags`를 직접 확인할 것.

## 웹 배포 규칙

- **웹 배포는 로컬에서 수동 실행한다.** (CI 워크플로우 없음)
- 배포 절차:
  1. **현재 워킹트리 기준으로 빌드**(미커밋 발행본 포함). `git reset --hard`는 쓰지 않는다 — 커밋 안 한 web-articles 발행본/렌더러 수정을 날린다. main 최신 반영이 필요하면 `git fetch origin main && git rebase origin/main`로 비파괴적으로. 배포 전 워킹트리에 의도치 않은 변경(app src 등)이 없는지 `git status`로 확인.
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
