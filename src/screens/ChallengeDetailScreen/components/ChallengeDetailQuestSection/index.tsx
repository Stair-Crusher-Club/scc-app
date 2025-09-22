import {color} from '@/constant/color';
import {font} from '@/constant/font';
import {ChallengeQuestDto} from '@/generated-sources/openapi';
import React from 'react';
import styled from 'styled-components/native';
import QuestItem from './QuestItem';

interface ChallengeDetailQuestSectionProps {
  quests: ChallengeQuestDto[];
}

export default function ChallengeDetailQuestSection({
  quests,
}: ChallengeDetailQuestSectionProps) {
  const getChunkQuests = (): ChallengeQuestDto[][] => {
    const result: ChallengeQuestDto[][] = [];
    for (let i = 0; i < quests.length; i += 2) {
      result.push(quests.slice(i, i + 2));
    }
    return result;
  };

  const chunkQuests = getChunkQuests();

  return (
    <Container>
      <Title>나의 퀘스트</Title>
      <Column>
        {chunkQuests.map((rowItems, rowIndex) => (
          <Row key={rowIndex}>
            {rowItems.map(quest => (
              <QuestItem key={quest.id} {...quest} />
            ))}
          </Row>
        ))}
      </Column>
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

const Column = styled.View({
  gap: 8,
});

const Row = styled.View({
  gap: 8,
  flexDirection: 'row',
});
