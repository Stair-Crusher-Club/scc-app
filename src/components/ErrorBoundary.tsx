import crashlytics from '@react-native-firebase/crashlytics';
import React from 'react';

interface Props {
  children: React.ReactNode;
}

/**
 * 최상위 JS 렌더 예외를 Crashlytics에 기록만 하는 report-only 바운더리.
 * fallback UI는 렌더하지 않고 children을 그대로 통과시킨다.
 * (native 크래시/ANR은 RN JS로 못 잡으므로 여기 대상 아님 — Crashlytics 네이티브가 담당.)
 */
class ErrorBoundary extends React.Component<Props> {
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // log/recordError는 Promise를 반환 — componentDidCatch는 동기라 rejection이 새지 않도록 가드.
    crashlytics()
      .log(`ErrorBoundary caught: ${info.componentStack ?? ''}`)
      .catch(() => {});
    crashlytics()
      .recordError(error)
      .catch(() => {});
  }

  render() {
    return this.props.children;
  }
}

export default ErrorBoundary;
