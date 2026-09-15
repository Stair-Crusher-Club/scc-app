module.exports = {
  preset: 'react-native',
  // react-native preset 은 moduleFileExtensions 를 정의하지 않는다. jest 기본값과 달리
  // ts/tsx 를 js 보다 앞에 둬야 같은 이름의 .ts/.js 가 있을 때 ts 가 먼저 잡힌다.
  // (원래 package.json 의 `jest` 키에 있었는데, 설정 파일이 둘이면 jest 가 실행을 거부한다)
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // 서브에이전트 worktree 격리(.claude/worktrees/<agent>/)는 레포 **안에** 체크아웃을 만든다.
  // 제외하지 않으면 같은 테스트가 worktree 수만큼 중복 수집되고, 그쪽 node_modules 부재로
  // "Test suite failed to run" 이 무더기로 나 실제 회귀를 가린다 (2026-09-15 실측: 15 suite 실패 중
  // 14 건이 worktree 사본이었다).
  testPathIgnorePatterns: ['/node_modules/', '/.claude/worktrees/'],
  modulePathIgnorePatterns: ['<rootDir>/.claude/worktrees/'],
};
