import React, {useState} from 'react';
import {Image, ActivityIndicator} from 'react-native';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

interface LastMonthRankingSectionProps {
  imageUrl: string;
}

export default function LastMonthRankingSection({
  imageUrl,
}: LastMonthRankingSectionProps) {
  const [imageLoading, setImageLoading] = useState(true);

  return (
    <Container>
      <SectionTitle>지난달 랭킹</SectionTitle>
      <ImageWrapper>
        {imageLoading && (
          <LoadingContainer>
            <ActivityIndicator size="large" color={color.brand60} />
          </LoadingContainer>
        )}
        <RankingImage
          source={{uri: imageUrl}}
          resizeMode="contain"
          onLoad={() => setImageLoading(false)}
          onError={() => setImageLoading(false)}
        />
      </ImageWrapper>
    </Container>
  );
}

const Container = styled.View({
  width: '100%',
  paddingHorizontal: 20,
  gap: 16,
});

const SectionTitle = styled.Text({
  fontSize: 18,
  lineHeight: 26,
  fontFamily: font.pretendardBold,
  color: color.black,
});

const ImageWrapper = styled.View({
  width: '100%',
  aspectRatio: 1,
  borderRadius: 12,
  overflow: 'hidden',
  backgroundColor: color.gray10,
  justifyContent: 'center',
  alignItems: 'center',
});

const LoadingContainer = styled.View({
  position: 'absolute',
  width: '100%',
  height: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1,
});

const RankingImage = styled(Image)({
  width: '100%',
  height: '100%',
});
