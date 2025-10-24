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

  const handleLayout = (event: LayoutChangeEvent) => {
    const {width} = event.nativeEvent.layout;
    if (width > 0) {
      setMeasuredWidth(width);
    }
  };

  useEffect(() => {
    // Wait for either containerWidth prop or measured width
    const width = measuredWidth;
    if (!width) {
      return;
    }

    setImageLoading(true);
    setImageHeight(undefined);

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
  }, [imageUrl, measuredWidth]);

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
