import React, {useEffect, useState} from 'react';
import {
  Image,
  ViewStyle,
  ImageResizeMode,
  LayoutChangeEvent,
} from 'react-native';
import styled from 'styled-components/native';

import {color} from '@/constant/color';

// 메모리 캐시 (앱 재시작 시 초기화됨)
const imageSizeCache = new Map<string, {width: number; height: number}>();

interface SccRemoteImageProps {
  imageUrl: string;
  onReady?: () => void;
  resizeMode?: ImageResizeMode;
  style?: ViewStyle;
  wrapperBackgroundColor?: string | null;
}

export default function SccRemoteImage({
  imageUrl,
  onReady,
  resizeMode = 'cover',
  style,
  wrapperBackgroundColor,
}: SccRemoteImageProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageHeight, setImageHeight] = useState<number | undefined>();
  const [measuredWidth, setMeasuredWidth] = useState<number | undefined>();
  const [originalSize, setOriginalSize] = useState<
    {width: number; height: number} | undefined
  >();

  const calculateHeight = (imageSize: {width: number; height: number}) => {
    return ((measuredWidth || 0) / imageSize.width) * imageSize.height;
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    const {width} = event.nativeEvent.layout;
    setMeasuredWidth(width);
  };

  // Get original image size only when imageUrl changes
  useEffect(() => {
    setImageLoading(true);
    setImageHeight(undefined);
    setOriginalSize(undefined);

    // 캐시 확인
    const cached = imageSizeCache.get(imageUrl);
    if (cached) {
      setOriginalSize(cached);
      return;
    }

    // 캐시에 없으면 Image.getSize 호출
    Image.getSize(
      imageUrl,
      (originalWidth, originalHeight) => {
        const size = {width: originalWidth, height: originalHeight};
        imageSizeCache.set(imageUrl, size); // 캐시에 저장
        setOriginalSize(size);
      },
      () => {
        // Error callback - still set loading to false
        setImageLoading(false);
      },
    );
  }, [imageUrl]);

  // Calculate height when measured width or original size changes
  useEffect(() => {
    // measuredWidth가 0일 수도 있으니 === undefined로 체크해야 한다.
    if (measuredWidth === undefined || originalSize === undefined) {
      return;
    }

    setImageHeight(calculateHeight(originalSize));
  }, [measuredWidth, originalSize]);

  useEffect(() => {
    if (!imageLoading && imageHeight !== undefined) {
      onReady?.();
    }
  }, [imageLoading, imageHeight, onReady]);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const resolvedBackgroundColor =
    wrapperBackgroundColor === null
      ? 'transparent'
      : (wrapperBackgroundColor ?? color.gray10);

  return (
    <ImageWrapper
      style={[
        measuredWidth !== undefined && imageHeight !== undefined
          ? {height: imageHeight}
          : originalSize
            ? {aspectRatio: originalSize.width / originalSize.height}
            : undefined,
        {backgroundColor: resolvedBackgroundColor},
        style,
      ]}
      onLayout={handleLayout}>
      <StyledImage
        source={{uri: imageUrl, cache: 'force-cache'}}
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
});

const StyledImage = styled(Image)({
  width: '100%',
  height: '100%',
});
