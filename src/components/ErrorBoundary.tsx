import crashlytics from '@react-native-firebase/crashlytics';
import React from 'react';
import {Text, View} from 'react-native';
import styled from 'styled-components/native';

import {SccTouchableOpacity} from '@/components/SccTouchableOpacity';
import {color} from '@/constant/color';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * 최상위 JS 렌더 예외를 잡아 Crashlytics에 기록하고, 흰 화면 대신 재시도 UI를 보여준다.
 * (native 크래시/ANR은 RN JS로 못 잡으므로 여기 대상 아님 — Crashlytics 네이티브가 담당.)
 */
class ErrorBoundary extends React.Component<Props, State> {
  state: State = {hasError: false};

  static getDerivedStateFromError(): State {
    return {hasError: true};
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    crashlytics().log(`ErrorBoundary caught: ${info.componentStack ?? ''}`);
    crashlytics().recordError(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container>
          <Title>일시적인 오류가 발생했어요</Title>
          <Desc>다시 시도해도 계속되면 앱을 완전히 종료 후 실행해주세요.</Desc>
          <RetryButton
            elementName="error_boundary_retry"
            onPress={() => this.setState({hasError: false})}>
            <RetryText>다시 시도</RetryText>
          </RetryButton>
        </Container>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

const Container = styled(View)`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background-color: ${color.white};
`;

const Title = styled(Text)`
  font-size: 18px;
  font-weight: 700;
  color: ${color.black};
  margin-bottom: 8px;
`;

const Desc = styled(Text)`
  font-size: 14px;
  color: ${color.gray70};
  text-align: center;
  margin-bottom: 24px;
`;

const RetryButton = styled(SccTouchableOpacity)`
  padding: 12px 24px;
  border-radius: 8px;
  background-color: ${color.brandColor};
`;

const RetryText = styled(Text)`
  font-size: 15px;
  font-weight: 600;
  color: ${color.white};
`;
