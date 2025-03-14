import Lottie from 'lottie-react-native';
import React from 'react';
import {useEffect, useRef} from 'react';
import styled from 'styled-components/native';

export default function SearchLoading() {
  const loadingLottie = useRef<Lottie>(null);
  useEffect(() => {
    loadingLottie.current?.play();
    return () => {
      loadingLottie.current?.pause();
    };
  }, [loadingLottie]);

  return (
    <LoadingContainer>
      <LoadingIcon
        ref={loadingLottie}
        source={require('@/assets/animations/ani_loading_dots.json')}
        loop
      />
    </LoadingContainer>
  );
}
const LoadingContainer = styled.View`
  flex-grow: 1;
  justify-content: center;
  align-items: center;
`;

const LoadingIcon = styled(Lottie)`
  width: 30px;
  height: 6px;
`;
