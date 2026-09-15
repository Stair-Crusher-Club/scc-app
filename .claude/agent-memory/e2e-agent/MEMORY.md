# E2E Agent Memory

- [PDP 딥링크 진입](pdp_deeplink_navigation.md) — placeId를 알면 stair-crusher://place/<id> 로 검색 UI 없이 바로 진입
- [dev LogBox 배너가 하단 버튼 탭을 막음](dev_logbox_banner_blocks_taps.md) — 화면 하단 버튼 무반응 시 배너 겹침부터 확인
- [검색 화면 자체 검증 시 진입/탭 요령](search-card-tap-and-guest-entry.md) — 비회원 둘러보기로 로그인 우회, ScoreLabel 배지 탭하면 툴팁 함정
- [공유 체크아웃 git 오염](shared-checkout-git-contamination.md) — 병렬 세션이 메인 checkout의 브랜치를 바꿔 렌더가 세션 중간에 달라질 수 있다, HEAD/reflog 확인
- [실제 카카오 없이 IDENTIFIED 로그인 확보](identified-login-without-real-kakao.md) — 기존 로그인 세션 재사용 우선, 신규 계정은 /signUp 서버 직접 호출(단 앱 세션 주입은 불가)
