import React, {useEffect, useState} from 'react';
import {Image, Dimensions, ViewStyle, ImageResizeMode} from 'react-native';
import styled from 'styled-components/native';

import {color} from '@/constant/color';

interface SccRemoteImageProps {
  imageUrl: string;
  containerWidth?: number;
  onReady?: () => void;
  resizeMode?: ImageResizeMode;
  style?: ViewStyle;
}

export default function SccRemoteImage({
  imageUrl,
  containerWidth,
  onReady,
  resizeMode = 'cover',
  style,
}: SccRemoteImageProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageHeight, setImageHeight] = useState<number | undefined>();

  useEffect(() => {
    setImageLoading(true);
    setImageHeight(undefined);

    // Get image dimensions and calculate height for width 100%
    const width = containerWidth ?? Dimensions.get('window').width;

    Image.getSize(
      imageUrl,
      (originalWidth, originalHeight) => {
        // Calculate height maintaining aspect ratio
        const calculatedHeight = (width / originalWidth) * originalHeight;
        setImageHeight(calculatedHeight);
      },
      () => {
        // Error callback - still set loading to false
        setImageLoading(false);
      },
    );
  }, [imageUrl, containerWidth]);

  useEffect(() => {
    if (!imageLoading && imageHeight !== undefined) {
      onReady?.();
    }
  }, [imageLoading, imageHeight, onReady]);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  return (
    <ImageWrapper style={[{height: imageHeight}, style]}>
      <StyledImage
        source={{uri: imageUrl}}
        resizeMode={resizeMode}
        onLoad={handleImageLoad}
        onError={() => setImageLoading(false)}
      />
    </ImageWrapper>
  );
}

const ImageWrapper = styled.View({
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: color.gray10,
});

const StyledImage = styled(Image)({
  width: '100%',
  height: '100%',
});
