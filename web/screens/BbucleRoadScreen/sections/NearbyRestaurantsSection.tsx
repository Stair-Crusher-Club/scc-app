import React from 'react';
import { View, Text, ScrollView, Linking, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import type { BbucleRoadSectionDto } from '@/generated-sources/openapi';

import SccRemoteImage from '@/components/SccRemoteImage';

interface NearbyRestaurantsSectionProps {
  section: BbucleRoadSectionDto;
}

export default function NearbyRestaurantsSection({ section }: NearbyRestaurantsSectionProps) {
  const handleAppLinkPress = () => {
    Linking.openURL('https://link.staircrusher.club/hdcq6z');
  };

  return (
    <Container>
      {section.title && <SectionTitle>{section.title}</SectionTitle>}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <CardGrid>
          {section.imageUrls?.map((imageUrl, index) => (
            <ImageContainer key={index}>
              <SccRemoteImage
                imageUrl={imageUrl}
                resizeMode="contain"
                style={{ borderRadius: 8 }}
              />
            </ImageContainer>
          ))}
        </CardGrid>
      </ScrollView>
      <AppLinkButton onPress={handleAppLinkPress}>
        <AppLinkButtonText>계뿌클에서 더 많은 식당 확인하기</AppLinkButtonText>
      </AppLinkButton>
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

const CardGrid = styled(View)`
  flex-direction: row;
  gap: 12px;
`;

const ImageContainer = styled(View)`
  width: 300px;
`;

const AppLinkButton = styled(TouchableOpacity)`
  background-color: #0c76f7;
  padding-vertical: 16px;
  padding-horizontal: 12%;
  border-radius: 100px;
  align-items: center;
  justify-content: center;
  margin-top: 48px;
  align-self: center;
  max-width: 80%;
`;

const AppLinkButtonText = styled(Text)`
  font-family: Pretendard;
  font-size: 18px;
  font-weight: 500;
  line-height: 24px;
  color: #ffffff;
  text-align: center;
`;
