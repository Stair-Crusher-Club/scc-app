import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ViewStyle, LayoutChangeEvent} from 'react-native';
import FastImage, {ResizeMode, OnLoadEvent} from '@d11/react-native-fast-image';
import styled from 'styled-components/native';

import {color} from '@/constant/color';

// 메모리 캐시: URL → { width, height }
const imageSizeCache = new Map<string, {width: number; height: number}>();

interface SccRemoteImageProps {
  imageUrl: string;
  onReady?: () => void;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  style?: ViewStyle;
  wrapperBackgroundColor?: string | null;
  fixedHeight?: number;
  priority?: 'low' | 'normal' | 'high';
}

const RESIZE_MODE_MAP: Record<string, ResizeMode> = {
  cover: FastImage.resizeMode.cover,
  contain: FastImage.resizeMode.contain,
  stretch: FastImage.resizeMode.stretch,
  center: FastImage.resizeMode.center,
};

export default function SccRemoteImage({
  imageUrl,
  onReady,
  resizeMode = 'cover',
  style,
  wrapperBackgroundColor,
  fixedHeight,
  priority = 'normal',
}: SccRemoteImageProps) {
  const [ready, setReady] = useState(false);
  const [originalSize, setOriginalSize] = useState<
    {width: number; height: number} | undefined
  >();
  const [measuredWidth, setMeasuredWidth] = useState<number | undefined>();

  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    setMeasuredWidth(event.nativeEvent.layout.width);
  }, []);

  // 캐시에서 사이즈 복원
  useEffect(() => {
    setReady(false);
    setOriginalSize(undefined);

    const cached = imageSizeCache.get(imageUrl);
    if (cached) {
      setOriginalSize(cached);
    }
  }, [imageUrl]);

  // onLoad에서 사이즈 확보, ready는 사이즈+레이아웃 준비 후
  const handleImageLoad = useCallback(
    (e: OnLoadEvent) => {
      const {width, height} = e.nativeEvent;

      if (!imageSizeCache.has(imageUrl)) {
        imageSizeCache.set(imageUrl, {width, height});
      }
      setOriginalSize({width, height});

      if (measuredWidth !== undefined) {
        setReady(true);
        onReadyRef.current?.();
      }
    },
    [imageUrl, measuredWidth],
  );

  // onLayout 후 사이즈가 있으면 ready
  useEffect(() => {
    if (measuredWidth !== undefined && originalSize && !ready) {
      setReady(true);
      onReadyRef.current?.();
    }
  }, [measuredWidth, originalSize, ready]);

  const resolvedBackgroundColor =
    wrapperBackgroundColor === null
      ? 'transparent'
      : (wrapperBackgroundColor ?? color.gray10);

  const fastImageSource = {
    uri: imageUrl,
    priority:
      priority === 'high'
        ? FastImage.priority.high
        : priority === 'low'
          ? FastImage.priority.low
          : FastImage.priority.normal,
  };

  const aspectRatio = originalSize
    ? originalSize.width / originalSize.height
    : undefined;

  if (fixedHeight != null) {
    return (
      <FastImage
        source={fastImageSource}
        resizeMode={RESIZE_MODE_MAP[resizeMode]}
        onLoad={handleImageLoad}
        onError={() => setReady(true)}
        style={[
          {height: fixedHeight, backgroundColor: resolvedBackgroundColor},
          aspectRatio != null ? {aspectRatio} : undefined,
          style as any,
        ]}
      />
    );
  }

  const imageHeight =
    measuredWidth !== undefined && originalSize !== undefined
      ? (measuredWidth / originalSize.width) * originalSize.height
      : undefined;

  return (
    <ImageWrapper
      style={[
        imageHeight !== undefined
          ? {height: imageHeight}
          : aspectRatio != null
            ? {aspectRatio}
            : undefined,
        {backgroundColor: resolvedBackgroundColor},
        style,
      ]}
      onLayout={handleLayout}>
      <FastImage
        source={fastImageSource}
        resizeMode={RESIZE_MODE_MAP[resizeMode]}
        onLoad={handleImageLoad}
        onError={() => setReady(true)}
        style={{width: '100%', height: '100%'}}
      />
    </ImageWrapper>
  );
}

/**
 * 이미지를 미리 fetch하여 캐시에 저장.
 */
export function prefetchRemoteImage(url: string): void {
  if (imageSizeCache.has(url)) return;
  FastImage.preload([{uri: url}]);
}

const ImageWrapper = styled.View({
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
});
