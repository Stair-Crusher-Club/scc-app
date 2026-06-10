---
name: scc-app-release
description: SCC 앱 OTA 배포 + 웹 배포 절차. "OTA 배포해줘", "앱 출시", "웹 배포", "web-deploy", "프로덕션에 올려줘" 같은 명시적 배포 요청 시에만 사용. 배포는 one-way door — 이 skill의 절차를 벗어나 임의로 배포하지 않는다.
disable-model-invocation: true
---

# SCC App Release — OTA / 웹 배포

## OTA 배포 규칙 (MANDATORY)

- **`ota-deploy` 수동 실행 금지.** OTA 배포는 main 푸시 시 자동 실행된다.
- 배포 절차: 코드 변경 → lint/tsc 통과 → 커밋 → 태그(`v{major}.{minor}-YYYYMMDD-NN`) → main 푸시 (자동 배포)
- 태그 없이 푸시하지 않는다
- git push/tag는 사용자가 명시적으로 요청한 것만 실행한다 (태그 생성/push는 hook이 ask로 가로챈다)

## 웹 배포 규칙

- **웹 배포는 로컬에서 수동 실행한다.** (CI 워크플로우 없음)
- 배포 절차:
  1. `git checkout main && git reset --hard origin/main` (최신 main 기준)
  2. `yarn web:build` (production 빌드 → `web-dist/`)
     - 내부적으로 `ENVFILE=subprojects/scc-frontend-build-configurations/production/.env`가 강제되어 `BASE_URL=https://api.staircrusher.club`가 bake된다.
     - `ENVFILE=.env.local` 같이 native dev용 env로 빌드하면 `BASE_URL=10.0.2.2:8080`이 박혀 일반 브라우저에서 닿지 못한다. 절대 그렇게 빌드하지 말 것.
  3. **빌드 후 반드시 로컬에서 동작 확인** — `yarn web`으로 dev server 띄우고 Playwright 또는 브라우저로 주요 페이지 접속 테스트. 콘솔 에러 없는지 확인.
  4. `aws-vault exec swann-scc -- ./web-deploy.sh` (S3 업로드 + CloudFront 무효화)
- **배포 전 테스트 필수 (MANDATORY)**: 테스트 없이 배포하지 않는다. 최소한 데스크톱/모바일 각각 1개 페이지씩 접속하여 렌더링 + 콘솔 에러 확인.

### 인프라 정보

- S3 버킷 `staircrusher-club-web` + CloudFront `E3RDKBHB12EC6A`
- 프로덕션 URL: `https://d2casvwkfuypye.cloudfront.net`
- CloudFront 전파에 최대 15분 소요
- OG 페이지 생성(`generate-og-pages.js`) 타임아웃은 배포에 영향 없음 (pre-rendering 실패해도 SPA 동작)
- **지도 관련 기능은 port 3000에서 테스트해야 함** (네이버 지도 API 키가 localhost:3000에 바인딩)

### 배포 후 검증 — 캐시 문제는 하드 리프레시로 해결

배포 후 production URL에서 변경 사항이 안 보일 때(번들이 분명 새로 올라갔는데도 옛 동작이 보일 때) 99%는 브라우저 캐시 문제다.

- `Cmd+Shift+R` (Mac) / `Ctrl+Shift+R` (Win/Linux)로 하드 리프레시하면 즉시 해결
- CloudFront invalidation은 이미 deploy 스크립트가 처리하므로 추가로 기다릴 필요 없음
- Playwright로 검증할 때는 query string cache buster(`?cb=...`)만으로는 부족 — `browser_close` 후 새 컨텍스트로 재진입하거나 `bypass cache` 옵션 필요
- 사용자가 "안 보인다"고 보고할 때도 먼저 하드 리프레시를 안내한다
