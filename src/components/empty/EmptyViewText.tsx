import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {PropsWithChildren} from 'react';
import styled from 'styled-components/native';

export default function EmptyViewText({children}: PropsWithChildren) {
  return (
    <Container>
      <NoResultText>{children}</NoResultText>
    </Container>
  );
}

const Container = styled.View`
  flex-grow: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding-top: 60px;
  padding-bottom: 60px;
`;

const NoResultText = styled.Text`
  font-size: 14px;
  font-family: ${() => font.pretendardMedium};
  color: ${() => color.gray50};
`;
