import React, {useEffect, useState} from 'react';
import {Image, ViewStyle, ImageResizeMode, LayoutChangeEvent} from 'react-native';
import styled from 'styled-components/native';

import {color} from '@/constant/color';

interface SccRemoteImageProps {
  imageUrl: string;
  onReady?: () => void;
  resizeMode?: ImageResizeMode;
  style?: ViewStyle;
}

export default function SccRemoteImage({
  imageUrl,
  onReady,
  resizeMode = 'cover',
  style,
}: SccRemoteImageProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageHeight, setImageHeight] = useState<number | undefined>();
  const [measuredWidth, setMeasuredWidth] = useState<number | undefined>();
  const [originalSize, setOriginalSize] = useState<{width: number; height: number} | undefined>();

  const handleLayout = (event: LayoutChangeEvent) => {
    const {width} = event.nativeEvent.layout;
    if (width > 0) {
      setMeasuredWidth(width);
    }
  };

  // Get original image size only when imageUrl changes
  useEffect(() => {
    setImageLoading(true);
    setImageHeight(undefined);
    setOriginalSize(undefined);

    Image.getSize(
      imageUrl,
      (originalWidth, originalHeight) => {
        setOriginalSize({width: originalWidth, height: originalHeight});
      },
      () => {
        // Error callback - still set loading to false
        setImageLoading(false);
      },
    );
  }, [imageUrl]);

  // Calculate height when measured width or original size changes
  useEffect(() => {
    if (!measuredWidth || !originalSize) {
      return;
    }

    const calculatedHeight = (measuredWidth / originalSize.width) * originalSize.height;
    setImageHeight(calculatedHeight);
  }, [measuredWidth, originalSize]);

  useEffect(() => {
    if (!imageLoading && imageHeight !== undefined) {
      onReady?.();
    }
  }, [imageLoading, imageHeight, onReady]);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  return (
    <ImageWrapper style={[{height: imageHeight}, style]} onLayout={handleLayout}>
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
