---
name: identified-login-without-real-kakao
description: 참여/등록처럼 IDENTIFIED 인증이 필요한 시나리오를 실기기 없이도 검증할 때, 실제 카카오 계정 없이 로그인 상태를 확보하는 법.
metadata:
  type: feedback
---

챌린지 참여, PA 등록처럼 로그인(IDENTIFIED)이 필요한 화면은 [[search-card-tap-and-guest-entry]]의 "비회원 둘러보기"로
우회할 수 없다. 카카오/애플 로그인은 실제 계정이 필요해 자동화가 어렵다.

**해법 1 — 이미 로그인된 에뮬레이터 세션 재사용이 최우선.** 에뮬레이터 앱 데이터가 이전 세션에서 만든 계정으로
이미 로그인돼 있을 수 있다(react-native-config/MMKV는 `run-android` 재빌드로 안 지워짐, 완전 uninstall 때만 지워짐).
홈 화면을 열어보고 로그인 상태(챌린지 카드·닉네임 등)가 이미 있으면 그걸 그대로 쓴다 — 새로 만들 필요 없음.

**해법 2 — 새 계정이 필요하면 `POST /signUp`(닉네임+비밀번호)으로 서버에서 직접 만든다.** 앱 UI에는 이 경로가 없지만
서버 엔드포인트는 살아있다: `POST /createAnonymousUser` → 응답의 `authTokens.accessToken`을
`Authorization: Bearer <token>` 헤더로 `POST /signUp {"nickname":"...","password":"..."}` 호출 → 204 응답 헤더
`X-SCC-ACCESS-KEY`가 새 IDENTIFIED 유저의 진짜 토큰. 이 유저는 완전한 정식 계정이라 챌린지 참여 등 모든 IDENTIFIED
액션이 그대로 된다.

**주의**: 이렇게 서버로 만든 토큰을 **앱 세션에 주입할 방법은 없다** — MMKV(react-native-mmkv)는 바이너리 포맷이라
adb로 직접 쓰는 건 시도하지 말 것(포맷이 복잡해 파일 손상 위험, 이번 세션에서 시도 안 하고 포기가 맞았음). 앱 UI로
직접 로그인해야 하는 시나리오면 해법 1(기존 로그인 재사용)만이 실질적 답이다. curl로 만든 계정은 **서버 쪽 데이터
준비**(예: 참여자 fixture, PA 등록 fixture를 DB에 직접 심을 때 쓸 user_id 확보용)로만 쓰고, 앱 UI 검증 자체는
에뮬레이터에 이미 로그인된 계정으로 한다.

관련: [[search-card-tap-and-guest-entry]]
