import LottieView, {LottieViewProps} from 'lottie-react-native';
import React from 'react';
import styled from 'styled-components/native';

export default function StampLottie(props: LottieViewProps) {
  return (
    <Container>
      <LottieView
        loop={false}
        autoPlay
        style={{
          width: 300,
          height: 300,
        }}
        {...props}
      />
    </Container>
  );
}
const Container = styled.View`
  justify-content: center;
  align-items: center;
  flex: 1;
  width: 300px;
  height: 300px;
`;
