import React from 'react';
import styled from 'styled-components/native';

export default function SearchLoading() {
  return (
    <LoadingContainer>
      <LoadingContent>
        <DotsContainer>
          <Dot1 />
          <Dot2 />
          <Dot3 />
        </DotsContainer>
        <LoadingText>검색 중...</LoadingText>
      </LoadingContent>
    </LoadingContainer>
  );
}

// Styled Components
const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
`;

const LoadingContent = styled.View`
  align-items: center;
  gap: 16px;
`;

const DotsContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const baseDotStyle = `
  width: 12px;
  height: 12px;
  background-color: #007aff;
  border-radius: 6px;

  @keyframes bounce {
    0%, 80%, 100% {
      transform: scale(0.8);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }

  animation: bounce 1.4s ease-in-out infinite both;
`;

const Dot1 = styled.View`
  ${baseDotStyle}
  animation-delay: 0s;
`;

const Dot2 = styled.View`
  ${baseDotStyle}
  animation-delay: 0.2s;
`;

const Dot3 = styled.View`
  ${baseDotStyle}
  animation-delay: 0.4s;
`;

const LoadingText = styled.Text`
  font-size: 16px;
  color: #666666;
  text-align: center;
`;
