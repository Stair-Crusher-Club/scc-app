---
name: search-card-tap-and-guest-entry
description: 검색/지도 화면 자체를 검증해야 할 때(딥링크로 우회 불가) 로그인 우회와 SearchItemCard 탭 함정.
metadata:
  type: feedback
---

[[pdp-deeplink-navigation]]은 PDP만 볼 때는 맞지만, **검색 결과 카드·지도 하단 카드 자체의 렌더링을
검증해야 하는 시나리오**(예: 배지/버튼 노출 조건 변경)에는 딥링크로 우회할 수 없다 — 검색 UI를 직접
타야 한다. 이때 유용한 것들:

1. **로그인 없이 진입**: 최초 실행 화면(카카오 로그인 유도)에서 "비회원 둘러보기" 버튼
   (`content-desc="비회원 둘러보기"`)을 탭하면 바로 지도 홈으로 들어간다. 검색/PDP 홈탭 검증에는
   인증이 필요 없다 — 굳이 로그인 절차를 밟지 않는다.
2. **검색어 입력**: 상단 검색바(`class=android.widget.EditText`, placeholder "장소, 주소 검색")를 탭한
   뒤 `uiautomator2`의 `d(className='android.widget.EditText').set_text('한글 검색어')`로 입력. 검색
   자동완성이 뜨는 카드는 `content-desc`에 "이름, 거리, 주소"가 합쳐진 형태로 붙어 있어 그 카드
   전체(`clickable=true`인 가장 바깥 ViewGroup)의 bounds 중심을 탭하면 확실하다.
3. **SearchItemCard 좌측 배지(ScoreLabel/"접근레벨 N")를 탭하면 카드가 아니라 정보 툴팁("레벨이
   낮을 수록...")이 뜬다** — PDP로 안 넘어가고 화면이 멈춘 것처럼 보인다. 카드 전체를 눌러 PDP로
   가려면 배지가 아니라 **장소명 텍스트**(`text="<장소명>"`, TextView) bounds를 탭해야 한다. 툴팁이
   떠 있으면 빈 여백을 한 번 탭해 닫고 다시 시도.
4. dev 서버(`https://api.dev.staircrusher.club`)의 `/createAnonymousUser` → `/searchPlaces`
   (`searchText`+`currentLocation`+`distanceMetersLimit` 필수, `keyword` 아님)를 curl로 먼저 찔러보면
   원하는 조건(카테고리·`hasPlaceAccessibility` true/false·서울 소재)의 실제 placeId/장소명을 앱을
   켜기 전에 미리 확보할 수 있어 에뮬레이터 왕복을 줄인다.

**Why:** 이 세션에서 "정보 요청하기 버튼 비노출" 검증 시 배지를 두 번 잘못 탭해 툴팁만 반복해서 띄우며
시간을 썼다. curl로 대상 placeId를 미리 확보해두니 실제 검증(스크린샷)에 들어가는 시간이 크게 줄었다.
**How to apply:** SearchItemCard/SearchMapView의 배지·버튼 노출 조건을 바꾼 변경을 검증할 때, 딥링크
대신 검색 흐름을 그대로 타야 하면 이 절차를 따른다.
