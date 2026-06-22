#!/usr/bin/env node
// Preflight for every web build/serve command.
//
// The web Kakao key (KAKAO_JS_KEY), BASE_URL 등 환경별 설정은
// `subprojects/scc-frontend-build-configurations` submodule 의 .env 에서 온다.
// 이 submodule 이 stale(기록된 커밋과 다른 커밋에 체크아웃) 하면, 빌드는 옛 .env 를
// 읽어 잘못된/누락된 키로 조용히 산출물을 만들고 그대로 배포돼 로그인이 깨진다
// (KOE114 Application ID mismatch). git submodule status 의 leading '+'/'-' 로
// drift 를 감지해 빌드를 fail-fast 시킨다. (재발 방지)
const {execSync} = require('child_process');

const SUBMODULE = 'subprojects/scc-frontend-build-configurations';

let status;
try {
  // 첫 글자가 상태 마커이므로 leading 공백을 보존한다(.trim() 금지). 끝 개행만 제거.
  status = execSync(`git submodule status ${SUBMODULE}`, {
    encoding: 'utf8',
  }).replace(/\s+$/, '');
} catch (e) {
  console.error(
    `\n❌ '${SUBMODULE}' submodule 상태를 확인할 수 없습니다.\n` +
      `   다음을 실행하세요: git submodule update --init ${SUBMODULE}\n`,
  );
  process.exit(1);
}

// git submodule status 출력 첫 글자:
//   ' ' = 기록된 커밋과 일치(정상)
//   '+' = 다른 커밋 체크아웃(drift)
//   '-' = 미초기화
//   'U' = merge conflict
const marker = status.charAt(0);
if (marker !== ' ') {
  const reason =
    marker === '-'
      ? '미초기화(uninitialized)'
      : marker === '+'
        ? '기록된 커밋과 다른 커밋에 체크아웃됨(drift)'
        : 'merge conflict';
  console.error(
    `\n❌ '${SUBMODULE}' submodule 이 stale 합니다 — ${reason}.\n` +
      `   현재 상태: ${status}\n` +
      `   옛 .env 로 빌드되면 잘못된 KAKAO_JS_KEY 등이 배포되어 로그인이 깨집니다.\n` +
      `   다음을 실행한 뒤 다시 시도하세요:\n` +
      `     git submodule update --init ${SUBMODULE}\n`,
  );
  process.exit(1);
}

console.log(`✅ ${SUBMODULE} submodule 최신 (기록된 커밋과 일치).`);
