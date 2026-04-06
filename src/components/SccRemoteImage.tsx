import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Image,
  ImageStyle,
  Platform,
  ViewStyle,
  ImageResizeMode,
  LayoutChangeEvent,
} from 'react-native';
import styled from 'styled-components/native';

import {color} from '@/constant/color';

// 메모리 캐시: URL → { width, height, dataUri? }
const imageCache = new Map<
  string,
  {width: number; height: number; dataUri: string | undefined}
>();

function parsePngSize(
  buffer: ArrayBuffer,
): {width: number; height: number} | null {
  const view = new DataView(buffer);
  if (buffer.byteLength < 24 || view.getUint8(0) !== 137) return null;
  return {width: view.getUint32(16), height: view.getUint32(20)};
}

function parseJpegSize(
  buffer: ArrayBuffer,
): {width: number; height: number} | null {
  const view = new DataView(buffer);
  if (buffer.byteLength < 4 || view.getUint16(0) !== 0xffd8) return null;
  let offset = 2;
  while (offset < buffer.byteLength - 1) {
    const marker = view.getUint16(offset);
    offset += 2;
    if (marker === 0xffc0 || marker === 0xffc2) {
      return {height: view.getUint16(offset + 3), width: view.getUint16(offset + 5)};
    }
    offset += view.getUint16(offset);
  }
  return null;
}

function parseImageSize(buffer: ArrayBuffer) {
  return parsePngSize(buffer) ?? parseJpegSize(buffer);
}

function arrayBufferToDataUri(buffer: ArrayBuffer, url: string): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const ext = url.toLowerCase();
  const mime = ext.endsWith('.jpg') || ext.endsWith('.jpeg')
    ? 'image/jpeg'
    : ext.endsWith('.webp')
      ? 'image/webp'
      : 'image/png';
  return `data:${mime};base64,${btoa(binary)}`;
}

interface SccRemoteImageProps {
  imageUrl: string;
  onReady?: () => void;
  resizeMode?: ImageResizeMode;
  style?: ViewStyle;
  wrapperBackgroundColor?: string | null;
  fixedHeight?: number;
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
  // 단일 상태: 이미지가 완전히 준비됐는지
  const [ready, setReady] = useState(false);
  const [originalSize, setOriginalSize] = useState<
    {width: number; height: number} | undefined
  >();
  const [dataUri, setDataUri] = useState<string | undefined>();
  const [measuredWidth, setMeasuredWidth] = useState<number | undefined>();

  // onReady를 ref로 안정화 — useEffect deps에서 제거
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  const mountTimeRef = useRef(Date.now());
  const logTiming = useCallback((label: string) => {
    if (!debugLog) return;
    console.log(`[SccRemoteImage] ${label}: +${Date.now() - mountTimeRef.current}ms`);
  }, [debugLog]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    setMeasuredWidth(event.nativeEvent.layout.width);
  }, []);

  // 이미지 사이즈 확보: race(fetch, Image.getSize)
  useEffect(() => {
    mountTimeRef.current = Date.now();
    logTiming('start');
    setReady(false);
    setOriginalSize(undefined);
    setDataUri(undefined);

    const cached = imageCache.get(imageUrl);
    if (cached) {
      logTiming('cache-hit');
      setOriginalSize({width: cached.width, height: cached.height});
      if (cached.dataUri) setDataUri(cached.dataUri);
      return;
    }

    let cancelled = false;
    let resolved = false;

    const onSizeResolved = (size: {width: number; height: number}, uri?: string) => {
      if (cancelled || resolved) return;
      resolved = true;
      logTiming(`resolved: ${size.width}x${size.height} via ${uri ? 'fetch' : 'getSize'}`);
      imageCache.set(imageUrl, {...size, dataUri: uri});
      setOriginalSize(size);
      if (uri) setDataUri(uri);
    };

    if (Platform.OS === 'ios') {
      // iOS: JS fetch + 헤더 파싱 + data URI — 네이티브 이미지 큐 우회
      fetch(imageUrl)
        .then(res => res.arrayBuffer())
        .then(buffer => {
          if (cancelled || resolved) return;
          logTiming(`fetch:done ${buffer.byteLength}B`);
          const size = parseImageSize(buffer);
          if (size) {
            onSizeResolved(size, arrayBufferToDataUri(buffer, imageUrl));
          }
        })
        .catch(() => {
          if (cancelled || resolved) return;
          logTiming('fetch:error, fallback to getSize');
          Image.getSize(
            imageUrl,
            (w, h) => onSizeResolved({width: w, height: h}),
            () => logTiming('getSize:error'),
          );
        });
    } else {
      // Android: 네이티브 Image.getSize (빠름, JS fetch는 Android에서 느림)
      Image.getSize(
        imageUrl,
        (w, h) => {
          if (cancelled || resolved) return;
          logTiming(`getSize:done ${w}x${h}`);
          onSizeResolved({width: w, height: h});
        },
        () => logTiming('getSize:error'),
      );
    }

    return () => { cancelled = true; };
  }, [imageUrl, logTiming]);

  // onLoad → ready. useEffect 체인 없이 직접 처리.
  const handleImageLoad = useCallback(() => {
    logTiming('onLoad');
    setReady(true);
    onReadyRef.current?.();
  }, [logTiming]);

  const resolvedBackgroundColor =
    wrapperBackgroundColor === null
      ? 'transparent'
      : (wrapperBackgroundColor ?? color.gray10);

  const imageSource = dataUri ? {uri: dataUri} : {uri: imageUrl};
  const aspectRatio = originalSize
    ? originalSize.width / originalSize.height
    : undefined;

  if (fixedHeight != null) {
    return (
      <Image
        source={imageSource}
        resizeMode={resizeMode}
        onLoad={handleImageLoad}
        onError={() => setReady(true)}
        style={[
          {height: fixedHeight, backgroundColor: resolvedBackgroundColor},
          aspectRatio != null ? {aspectRatio} : undefined,
          style as ImageStyle,
        ]}
      />
    );
  }

  // height 계산: measuredWidth와 originalSize가 있으면 직접 계산 (useEffect 불필요)
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
      <StyledImage
        source={imageSource}
        resizeMode={resizeMode}
        onLoad={handleImageLoad}
        onError={() => setReady(true)}
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
