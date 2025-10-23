import React, {useState, useEffect} from 'react';
import {Image, Dimensions} from 'react-native';
import styled from 'styled-components/native';

import {color} from '@/constant/color';
import {font} from '@/constant/font';

interface LastMonthRankingSectionProps {
  imageUrl: string;
}

export default function LastMonthRankingSection({
  imageUrl,
}: LastMonthRankingSectionProps) {
  const [imageHeight, setImageHeight] = useState<number | undefined>();

  useEffect(() => {
    // Get image dimensions and calculate height for width 100%
    const screenWidth = Dimensions.get('window').width;
    const containerWidth = screenWidth - 40; // paddingHorizontal 20px on each side

    Image.getSize(
      imageUrl,
      (width, height) => {
        // Calculate height maintaining aspect ratio
        const calculatedHeight = (containerWidth / width) * height;
        setImageHeight(calculatedHeight);
      },
      () => {
        // Error callback
      },
    );
  }, [imageUrl]);

  return (
    <Container>
      <SectionTitle>누적랭킹</SectionTitle>
      <ImageWrapper style={{height: imageHeight}}>
        <RankingImage
          source={{uri: imageUrl}}
          resizeMode="contain"
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

const RankingImage = styled(Image)({
  width: '100%',
  height: '100%',
});
