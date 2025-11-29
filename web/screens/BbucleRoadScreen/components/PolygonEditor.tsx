import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, Pressable } from 'react-native';
import styled from 'styled-components/native';
import Svg, { Polygon, Circle, Line } from 'react-native-svg';

import type { BbucleRoadPolygonPointDto } from '@/generated-sources/openapi';

interface PolygonEditorProps {
  /** 배경 이미지 URL */
  imageUrl: string;
  /** 편집 완료 콜백 */
  onComplete: (points: BbucleRoadPolygonPointDto[]) => void;
  /** 취소 콜백 */
  onCancel: () => void;
  /** 기존 점들 (편집 시) */
  initialPoints?: BbucleRoadPolygonPointDto[];
}

export default function PolygonEditor({
  imageUrl,
  onComplete,
  onCancel,
  initialPoints = [],
}: PolygonEditorProps) {
  const containerRef = useRef<View>(null);
  const [points, setPoints] = useState<BbucleRoadPolygonPointDto[]>(initialPoints);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [undoStack, setUndoStack] = useState<BbucleRoadPolygonPointDto[][]>([]);

  // 이미지 크기 로드
  useEffect(() => {
    Image.getSize(
      imageUrl,
      (width, height) => {
        setImageSize({ width, height });
      },
      (error) => {
        console.error('Failed to get image size:', error);
      },
    );
  }, [imageUrl]);

  // 컨테이너 높이 계산
  const displayHeight =
    containerSize.width && imageSize.width
      ? (containerSize.width * imageSize.height) / imageSize.width
      : 0;

  // Cmd+Z 키보드 이벤트 핸들러
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [undoStack]);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;

    const previousState = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setPoints(previousState);
  }, [undoStack]);

  const pushToUndoStack = useCallback(() => {
    setUndoStack((prev) => [...prev.slice(-49), points]);
  }, [points]);

  const handleContainerLayout = useCallback(
    (event: { nativeEvent: { layout: { width: number; height: number } } }) => {
      const { width, height } = event.nativeEvent.layout;
      setContainerSize({ width, height });
    },
    [],
  );

  const handleImageClick = useCallback(
    (event: any) => {
      // Web에서의 클릭 이벤트 처리
      const nativeEvent = event.nativeEvent;
      const target = nativeEvent.target as HTMLElement;
      const rect = target.getBoundingClientRect();

      const clickX = nativeEvent.clientX - rect.left;
      const clickY = nativeEvent.clientY - rect.top;

      // 상대 좌표로 변환 (0-1)
      const relativeX = clickX / containerSize.width;
      const relativeY = clickY / displayHeight;

      // 경계 체크
      if (relativeX < 0 || relativeX > 1 || relativeY < 0 || relativeY > 1) {
        return;
      }

      pushToUndoStack();
      setPoints((prev) => [...prev, { x: relativeX, y: relativeY }]);
    },
    [containerSize.width, displayHeight, pushToUndoStack],
  );

  const handleRemovePoint = useCallback(
    (index: number) => {
      pushToUndoStack();
      setPoints((prev) => prev.filter((_, i) => i !== index));
    },
    [pushToUndoStack],
  );

  const handleComplete = useCallback(() => {
    if (points.length < 3) {
      alert('최소 3개의 점이 필요합니다.');
      return;
    }
    onComplete(points);
  }, [points, onComplete]);

  const handleClear = useCallback(() => {
    if (points.length === 0) return;
    pushToUndoStack();
    setPoints([]);
  }, [points, pushToUndoStack]);

  // 상대 좌표를 픽셀 좌표로 변환
  const toPixelX = (x: number) => x * containerSize.width;
  const toPixelY = (y: number) => y * displayHeight;

  // Polygon 점들을 문자열로 변환
  const polygonPointsString = points
    .map((p) => `${toPixelX(p.x)},${toPixelY(p.y)}`)
    .join(' ');

  return (
    <Container>
      <Header>
        <HeaderTitle>Polygon 편집</HeaderTitle>
        <HeaderInfo>클릭으로 점 추가 | ⌘Z 실행취소</HeaderInfo>
      </Header>

      <ImageContainer onLayout={handleContainerLayout}>
        <Pressable onPress={handleImageClick}>
          <BackgroundImage
            source={{ uri: imageUrl }}
            style={{ height: displayHeight || 300 }}
            resizeMode="contain"
          />
        </Pressable>

        {displayHeight > 0 && (
          <SvgOverlay
            width={containerSize.width}
            height={displayHeight}
            pointerEvents="box-none"
          >
            {/* Polygon 영역 */}
            {points.length >= 3 && (
              <Polygon
                points={polygonPointsString}
                fill="rgba(0, 122, 255, 0.2)"
                stroke="rgba(0, 122, 255, 0.8)"
                strokeWidth={2}
              />
            )}

            {/* 점들 연결 선 */}
            {points.length >= 2 &&
              points.map((point, index) => {
                if (index === 0) return null;
                const prevPoint = points[index - 1];
                return (
                  <Line
                    key={`line-${index}`}
                    x1={toPixelX(prevPoint.x)}
                    y1={toPixelY(prevPoint.y)}
                    x2={toPixelX(point.x)}
                    y2={toPixelY(point.y)}
                    stroke="rgba(0, 122, 255, 0.8)"
                    strokeWidth={2}
                  />
                );
              })}

            {/* 마지막-첫번째 연결 선 (3점 이상일 때) */}
            {points.length >= 3 && (
              <Line
                x1={toPixelX(points[points.length - 1].x)}
                y1={toPixelY(points[points.length - 1].y)}
                x2={toPixelX(points[0].x)}
                y2={toPixelY(points[0].y)}
                stroke="rgba(0, 122, 255, 0.8)"
                strokeWidth={2}
                strokeDasharray="5,5"
              />
            )}

            {/* 점들 */}
            {points.map((point, index) => (
              <Circle
                key={`point-${index}`}
                cx={toPixelX(point.x)}
                cy={toPixelY(point.y)}
                r={8}
                fill="#007AFF"
                stroke="#fff"
                strokeWidth={2}
                onPress={() => handleRemovePoint(index)}
              />
            ))}
          </SvgOverlay>
        )}
      </ImageContainer>

      <PointsList>
        <PointsTitle>점 목록 ({points.length}개)</PointsTitle>
        {points.map((point, index) => (
          <PointItem key={index}>
            <PointIndex>{index + 1}</PointIndex>
            <PointCoords>
              x: {point.x.toFixed(3)}, y: {point.y.toFixed(3)}
            </PointCoords>
            <RemoveButton onPress={() => handleRemovePoint(index)}>
              <RemoveButtonText>×</RemoveButtonText>
            </RemoveButton>
          </PointItem>
        ))}
      </PointsList>

      <ButtonRow>
        <SecondaryButton onPress={handleClear} disabled={points.length === 0}>
          <SecondaryButtonText>초기화</SecondaryButtonText>
        </SecondaryButton>
        <SecondaryButton onPress={handleUndo} disabled={undoStack.length === 0}>
          <SecondaryButtonText>⌘Z 실행취소</SecondaryButtonText>
        </SecondaryButton>
      </ButtonRow>

      <ButtonRow>
        <CancelButton onPress={onCancel}>
          <CancelButtonText>취소</CancelButtonText>
        </CancelButton>
        <CompleteButton onPress={handleComplete} disabled={points.length < 3}>
          <CompleteButtonText>완료</CompleteButtonText>
        </CompleteButton>
      </ButtonRow>
    </Container>
  );
}

const Container = styled(View)`
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  margin: 16px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 8px;
  elevation: 4;
`;

const Header = styled(View)`
  margin-bottom: 16px;
`;

const HeaderTitle = styled(Text)`
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
`;

const HeaderInfo = styled(Text)`
  font-size: 13px;
  color: #666;
`;

const ImageContainer = styled(View)`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f0f0f0;
`;

const BackgroundImage = styled(Image)`
  width: 100%;
`;

const SvgOverlay = styled(Svg)`
  position: absolute;
  top: 0;
  left: 0;
`;

const PointsList = styled(View)`
  margin-top: 16px;
  max-height: 150px;
`;

const PointsTitle = styled(Text)`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const PointItem = styled(View)`
  flex-direction: row;
  align-items: center;
  padding: 8px;
  background-color: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 4px;
`;

const PointIndex = styled(Text)`
  width: 24px;
  font-size: 12px;
  font-weight: 600;
  color: #007aff;
`;

const PointCoords = styled(Text)`
  flex: 1;
  font-size: 12px;
  color: #666;
  font-family: monospace;
`;

const RemoveButton = styled(TouchableOpacity)`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background-color: #dc3545;
  align-items: center;
  justify-content: center;
`;

const RemoveButtonText = styled(Text)`
  color: #fff;
  font-size: 16px;
  font-weight: 600;
`;

const ButtonRow = styled(View)`
  flex-direction: row;
  gap: 12px;
  margin-top: 12px;
`;

const SecondaryButton = styled(TouchableOpacity)`
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  background-color: #f0f0f0;
  align-items: center;
`;

const SecondaryButtonText = styled(Text)`
  font-size: 14px;
  color: #333;
`;

const CancelButton = styled(TouchableOpacity)`
  flex: 1;
  padding: 14px;
  border-radius: 8px;
  background-color: #f0f0f0;
  align-items: center;
`;

const CancelButtonText = styled(Text)`
  font-size: 15px;
  font-weight: 600;
  color: #666;
`;

const CompleteButton = styled(TouchableOpacity)`
  flex: 1;
  padding: 14px;
  border-radius: 8px;
  background-color: #007aff;
  align-items: center;
`;

const CompleteButtonText = styled(Text)`
  font-size: 15px;
  font-weight: 600;
  color: #fff;
`;
