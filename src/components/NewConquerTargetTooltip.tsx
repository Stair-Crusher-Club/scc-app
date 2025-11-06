import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

interface NewConquerTargetTooltipProps {
  target: 'place' | 'building';
}

export default function NewConquerTargetTooltip({
  target,
}: NewConquerTargetTooltipProps) {
  const text = target === 'place' ? '새로운 장소 발견!' : '새로운 빌딩 발견!';

  return (
    <Container>
      <Text>{text}</Text>
      <Tail />
    </Container>
  );
}

const Container = styled.View`
  background-color: ${color.yellow70};
  border-radius: 4px;
  padding: 6px 8px;
  position: relative;
`;

const Text = styled.Text`
  color: #ffffff;
  font-size: 13px;
  line-height: 18px;
  font-family: ${font.pretendardBold};
`;

const Tail = styled.View`
  width: 10px;
  height: 10px;
  background-color: ${color.yellow70};
  transform: rotate(45deg);
  position: absolute;
  bottom: -5px;
  left: 8px;
`;
