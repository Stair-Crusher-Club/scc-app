/**
 * 콜드스타트 splash 지연 진단용 milestone 타임스탬프 (epoch ms).
 *
 * index.js 최상단에서 import되어 `jsStart`가 JS 실행 시작 시점에 가깝게 찍힌다.
 * 네이티브 콜드스타트(① 프로세스 시작 ~ JS 시작)는 JS에서 측정 불가 —
 * 그 구간은 Play Console(Android Vitals) / App Store Connect 시작 시간 메트릭 참조.
 *
 * 측정 구간:
 * - ② HotUpdater = otaCompleted - jsStart (check 왕복 + 다운로드 포함)
 * - 다운로드만   = otaCompleted - otaFirstProgress (otaFirstProgress가 있을 때)
 * - ③ 마운트~navReady = navReady - otaCompleted
 */
export const startupTiming = {
  jsStart: Date.now(),
  otaFirstProgress: 0,
  otaCompleted: 0,
};
