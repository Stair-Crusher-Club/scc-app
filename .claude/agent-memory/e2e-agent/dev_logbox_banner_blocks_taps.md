---
name: dev-logbox-banner-blocks-taps
description: dev 모드의 "Open debugger to view warnings" / API 에러 LogBox 배너가 화면 하단 요소의 터치를 가로챈다.
metadata:
  type: feedback
---

로컬 dev 빌드에서 화면 하단(대략 y>2140, 1080x2400 기준)에 뜨는 LogBox 알림 배너
("Open debugger to view warnings.", "API Error: ...")는 그 아래 겹쳐진 실제 UI 버튼의 터치를 완전히
가로챈다. `uiautomator2`의 `d(description=...).click()`처럼 접근성 API로 클릭해도 내부적으로 좌표
탭을 수행하므로 똑같이 막힌다 — description/text 매칭 성공 여부와 무관하게 안 눌린다.

증상: 바텀시트 CTA 버튼("의견 보내기" 등)처럼 화면 하단에 있는 버튼을 탭했는데 API 호출 로그가 전혀
안 찍히고 아무 변화도 없을 때, 배너가 그 버튼 위에 겹쳐 있는지 먼저 `uiautomator dump`로 bounds를
확인한다. 겹쳐 있으면 배너의 X(닫기) 버튼을 먼저 탭해서 없앤 뒤 재시도.

**Why:** "의견 보내기" 버튼을 `d(description='의견 보내기').click()`으로 눌렀는데 로그에 아무 요청도
안 찍혀서 30분 헛디버깅. `uiautomator dump`로 배너 bounds `[26,2146][1054,2271]`와 버튼 bounds
`[63,2127][1017,2274]`가 거의 완전히 겹치는 걸 확인하고서야 원인을 알았다.
**How to apply:** 화면 하단 버튼(CTA, 바텀시트 제출 버튼 등)을 탭했는데 아무 반응이 없으면, 먼저
"화면에 안 보이는 dev 배너가 겹쳐 있나"를 의심하고 dump로 확인 — 좌표/셀렉터를 다시 추측하기 전에.
관련: [[pdp-deeplink-navigation]]
