import React from 'react';
import { View, Text } from 'react-native';
import styled from 'styled-components/native';
import type { BbucleRoadSectionDto } from '@/generated-sources/openapi';

import SccRemoteImage from '@/components/SccRemoteImage';

interface WheelchairViewSectionProps {
  section: BbucleRoadSectionDto;
}

export default function WheelchairViewSection({ section }: WheelchairViewSectionProps) {
  if (!section.imageUrls || section.imageUrls.length === 0) {
    return null;
  }

  return (
    <Container>
      {section.title && <SectionTitle>{section.title}</SectionTitle>}
      {section.imageUrls.map((imageUrl: string, index: number) => (
        <SccRemoteImage
          key={index}
          imageUrl={imageUrl}
          resizeMode="contain"
          style={{ borderRadius: 8, marginBottom: 12 }}
        />
      ))}
    </Container>
  );
}

const Container = styled(View)`
  padding: 24px 16px;
  margin-bottom: 150px;
`;

const SectionTitle = styled(Text)`
  color: #000;
  text-align: center;
  font-family: Pretendard;
  font-size: 48px;
  font-style: normal;
  font-weight: 700;
  line-height: 130%;
  letter-spacing: -2.4px;
  margin-bottom: 20px;
  word-wrap: break-word;
  overflow-wrap: break-word;
`;
