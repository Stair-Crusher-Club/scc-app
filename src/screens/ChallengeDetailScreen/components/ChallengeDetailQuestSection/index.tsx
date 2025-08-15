import {color} from '@/constant/color';
import {font} from '@/constant/font';
import styled from 'styled-components/native';

export default function ChallengeDetailQuestSection() {
  return (
    <Container>
      <Title>나의 퀘스트</Title>
      {/* TODO: Flash list로 보여주기 */}
    </Container>
  );
}

const Container = styled.View({
  paddingHorizontal: 15,
});

const Title = styled.Text({
  color: color.black,
  fontSize: 20,
  fontFamily: font.pretendardBold,
  padding: 10,
});
