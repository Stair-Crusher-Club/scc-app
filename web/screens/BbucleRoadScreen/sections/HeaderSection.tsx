import React from 'react';
import { View, Text } from 'react-native';
import styled from 'styled-components/native';

import SccRemoteImage from '@/components/SccRemoteImage';
import { color } from '@/constant/color';

interface HeaderSectionProps {
  titleImageUrl: string;
  summaryItems: string[];
}

export default function HeaderSection({ titleImageUrl, summaryItems }: HeaderSectionProps) {
  const validSummaryItems = summaryItems.filter(item => item && item.trim().length > 0);
  const summaryTitle = `휠체어석 ${validSummaryItems.length}줄 요약`;

  return (
    <Container>
      <ImageWrapper>
        <SccRemoteImage
          imageUrl={titleImageUrl}
          resizeMode="contain"
        />
      </ImageWrapper>
      <SummarySection>
        <SummaryTitle>{summaryTitle}</SummaryTitle>
        <SummaryContainer>
          {validSummaryItems.map((item, index) => (
            <SummaryItem key={index}>
              <NumberBadge>
                <NumberText>{index + 1}</NumberText>
              </NumberBadge>
              <SummaryText>{item}</SummaryText>
            </SummaryItem>
          ))}
        </SummaryContainer>
      </SummarySection>
    </Container>
  );
}

const Container = styled(View)`
  padding: 24px 16px;
  margin-bottom: 150px;
`;

const ImageWrapper = styled(View)`
  width: 40%;
  align-self: center;
  margin-bottom: 20px;
`;

const SummarySection = styled(View)`
  margin-top: 60px;
  gap: 20px;
  align-items: center;
`;

const SummaryTitle = styled(Text)`
  font-family: Pretendard;
  font-size: 36px;
  font-weight: 700;
  line-height: 48px;
  color: #000000;
  text-align: center;
  width: 100%;
`;

const SummaryContainer = styled(View)`
  background-color: ${color.white};
  padding: 30px 40px;
  border-radius: 12px;
  gap: 20px;
  width: 100%;
`;

const SummaryItem = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: 18px;
`;

const NumberBadge = styled(View)`
  width: 48px;
  height: 48px;
  background-color: #f2f2f5;
  border-radius: 100px;
  align-items: center;
  justify-content: center;
`;

const NumberText = styled(Text)`
  font-family: Pretendard;
  font-size: 24px;
  font-weight: 400;
  line-height: 32px;
  color: #000000;
  text-align: center;
`;

const SummaryText = styled(Text)`
  flex: 1;
  font-family: Pretendard;
  font-size: 28px;
  font-weight: 400;
  line-height: 38px;
  color: #000000;
`;
