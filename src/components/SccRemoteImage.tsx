import React, {useEffect, useState} from 'react';
import {
  Image,
  ImageStyle,
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
  /** height 고정 + 원본 비율로 width 자동 계산 (fit-height 모드) */
  fixedHeight?: number;
  /** [DEBUG] 타이밍 로그 출력 */
  debugLog?: boolean;
}

export default function SccRemoteImage({
  imageUrl,
  onReady,
  resizeMode = 'cover',
  style,
  wrapperBackgroundColor,
  fixedHeight,
  debugLog,
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
    logTiming(`onLayout:width=${width}`);
    setMeasuredWidth(width);
  };

  // [DEBUG] timing
  const mountTimeRef = React.useRef(Date.now());
  const logTiming = (label: string) => {
    if (!debugLog) return;
    console.log(`[SccRemoteImage] ${label}: +${Date.now() - mountTimeRef.current}ms`);
  };

  // Get original image size only when imageUrl changes
  useEffect(() => {
    mountTimeRef.current = Date.now();
    logTiming('useEffect:getSize:start');
    setImageLoading(true);
    setImageHeight(undefined);
    setOriginalSize(undefined);

    // 캐시 확인
    const cached = imageSizeCache.get(imageUrl);
    if (cached) {
      logTiming('useEffect:getSize:cache-hit');
      setOriginalSize(cached);
      return;
    }

    // 캐시에 없으면 Image.getSize 호출
    logTiming('useEffect:getSize:network-start');
    Image.getSize(
      imageUrl,
      (originalWidth, originalHeight) => {
        logTiming('useEffect:getSize:network-done');
        const size = {width: originalWidth, height: originalHeight};
        imageSizeCache.set(imageUrl, size); // 캐시에 저장
        setOriginalSize(size);
      },
      () => {
        logTiming('useEffect:getSize:error');
        // Error callback - still set loading to false
        setImageLoading(false);
      },
    );
  }, [imageUrl]);

  // Calculate height when measured width or original size changes
  useEffect(() => {
    logTiming(`useEffect:calcHeight measuredWidth=${measuredWidth} originalSize=${!!originalSize}`);
    // measuredWidth가 0일 수도 있으니 === undefined로 체크해야 한다.
    if (measuredWidth === undefined || originalSize === undefined) {
      return;
    }

    logTiming('useEffect:calcHeight:done');
    setImageHeight(calculateHeight(originalSize));
  }, [measuredWidth, originalSize]);

  useEffect(() => {
    logTiming(`useEffect:onReady imageLoading=${imageLoading} imageHeight=${imageHeight}`);
    if (!imageLoading && imageHeight !== undefined) {
      logTiming('useEffect:onReady:FIRE');
      onReady?.();
    }
  }, [imageLoading, imageHeight, onReady]);

  const handleImageLoad = () => {
    logTiming('onLoad:image-loaded');
    setImageLoading(false);
  };

  const resolvedBackgroundColor =
    wrapperBackgroundColor === null
      ? 'transparent'
      : (wrapperBackgroundColor ?? color.gray10);

  if (fixedHeight != null) {
    // fit-height 모드: height 고정, 원본 비율로 width 자동 계산
    const aspectRatio = originalSize
      ? originalSize.width / originalSize.height
      : undefined;
    return (
      <Image
        source={{uri: imageUrl, cache: 'force-cache'}}
        resizeMode={resizeMode}
        onLoad={handleImageLoad}
        onError={() => setImageLoading(false)}
        style={[
          {height: fixedHeight, backgroundColor: resolvedBackgroundColor},
          aspectRatio != null ? {aspectRatio} : undefined,
          style as ImageStyle,
        ]}
      />
    );
  }

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
