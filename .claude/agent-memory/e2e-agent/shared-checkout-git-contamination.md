---
name: shared-checkout-git-contamination
description: scc-app 메인 체크아웃(워크트리 아님)에서 E2E 도중 다른 병렬 세션이 git HEAD를 바꿔 렌더 결과가 중간에 달라질 수 있다.
metadata:
  type: feedback
---

에뮬레이터 앱을 메인 `scc-app` 체크아웃(워크트리가 아니라 `git worktree list`에 안 뜨는 경로)에서 빌드해 테스트할 때,
같은 기능의 다른 서브태스크를 맡은 병렬 세션(예: `app-progress-home`, `app-places-celebration` 같은 워커)이
**같은 경로에서 `git checkout <다른 브랜치/커밋>` 을 실행**하면 Metro가 파일 변경을 감지해 즉시 핫리로드하고,
내가 이미 확인한 화면이 세션 중간에 조용히 다른(옛/무관한) 코드로 바뀐다.

**증상**: 챌린지 진행바가 첫 확인 때는 마일스톤 컬러 아이콘(신규 디자인)이었는데, 몇 분 뒤 재확인하니 8px plain
dot + 0% 눈금(구디자인)으로 바뀌어 있었다. 데이터는 동일(같은 API 응답, milestones=[3,5,7] 정상 확인)한데 렌더만 달랐다.

**진단**: `git status`(untracked만 있고 clean) → `git log -1`이 이상한 커밋 → `git reflog`로
`checkout: moving from feat/challenge-redesign-v2 to <무관한 과거 커밋>` 확인. 다른 세션이 저지른 것.

**How to apply**: 렌더 결과가 세션 중간에 설명 안 되게 바뀌면(특히 "분명 아까 확인했는데") 코드 버그로 단정하기 전에
`git log -1 --oneline` + `git reflog -5`로 HEAD가 내가 기대한 브랜치/커밋에 여전히 있는지부터 확인한다.
어긋나 있으면 즉시 올바른 브랜치로 `git checkout`하고, 그 오염 구간에 찍은 스크린샷은 전부 폐기하고 재확인한다.
팀리드에게도 실시간 보고 — 다른 세션이 아직도 같은 경로를 만지고 있을 수 있다.
관련: [[pdp-deeplink-navigation]]
