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
  const [imageAspectRatio, setImageAspectRatio] = useState<number | undefined>();

  const handleImageLoad = (e: any) => {
    const {width, height} = e.nativeEvent.source;
    if (width && height) {
      setImageAspectRatio(width / height);
    }
  };

  return (
    <Container>
      <SectionTitle>누적랭킹</SectionTitle>
      <ImageWrapper>
        <RankingImage
          source={{uri: imageUrl}}
          resizeMode="contain"
          onLoad={handleImageLoad}
          style={{aspectRatio: imageAspectRatio}}
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
  color: color.black,
  fontSize: 20,
  fontFamily: font.pretendardBold,
  padding: '10px 10px 0',
});

const ImageWrapper = styled.View({
  width: '100%',
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
});
