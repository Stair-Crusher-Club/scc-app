---
name: pdp-deeplink-navigation
description: PDP로 직접 진입하는 가장 빠른 방법은 검색 UI 탐색이 아니라 stair-crusher:// 딥링크다.
metadata:
  type: feedback
---

`adb shell input tap`으로 홈→검색→결과 리스트→지도 카드까지 눌러서 PDP에 진입하려 하면 표시 좌표와
실제 터치 좌표 스케일(1.2배) 혼동, 지도 스니펫 카드가 탭에 반응 안 하는 문제 등으로 여러 번 헛탕치기
쉽다. placeId를 이미 알고 있으면(spec/DB에 있음) 딥링크로 바로 PDP에 진입하는 게 훨씬 빠르고 안정적:

```bash
adb shell am start -a android.intent.action.VIEW -d "stair-crusher://place/<placeId>" <packageName>
```

스킴/경로는 `scc-app/src/navigation/linkingConfig.ts` (`path: 'place/:placeInfo'`, placeId가 경로
세그먼트 그대로) + `android/app/src/main/AndroidManifest.xml`에 정의돼 있다. 앱이 이미 실행 중이면
"Activity not started, intent has been delivered to currently running top-most instance" 경고가 뜨는데
정상 동작이다(기존 스택에 얹힘). 완전히 새로 마운트된 상태를 보고 싶으면(예: 재진입 시나리오)
`adb shell am force-stop <package>` 후 딥링크를 다시 쏴야 한다.

**Why:** 검색 UI 좌표 탭으로 5번 이상 실패한 뒤 발견. 화면 표시 좌표(Read 도구가 보여주는 900x2000)와
실제 디바이스 좌표(1080x2400, ×1.2)를 혼동하면 탭이 다른 요소에 맞거나 아예 빗나간다.
**How to apply:** 다음 E2E 세션에서 특정 placeId의 PDP/기타 화면에 진입해야 할 때, 검색 흐름을
재현해야 하는 시나리오가 아니라면 먼저 딥링크 스킴이 있는지 확인하고 그걸 쓴다.
관련: [[dev-logbox-banner-blocks-taps]]
