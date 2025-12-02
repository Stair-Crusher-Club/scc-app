import React, { useState, useCallback } from 'react';
import { View, Image, Text, Pressable, LayoutChangeEvent, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import Svg, { Polygon, Line } from 'react-native-svg';
import type {
  BbucleRoadInteractiveImageDto,
  BbucleRoadClickableRegionDto,
  BbucleRoadPolygonPointDto,
} from '@/generated-sources/openapi';

import { useEditMode } from '../context/EditModeContext';
import ImageUploader from './ImageUploader';

interface InteractiveImageProps {
  interactiveImage: BbucleRoadInteractiveImageDto;
  onRegionPress: (region: BbucleRoadClickableRegionDto) => void;
  /** 이미지 URL 변경 콜백 (edit mode) */
  onImageChange?: (url: string) => void;
  /** Route index (edit mode에서 region 편집 시 필요) */
  routeIndex?: number;
}

export default function InteractiveImage({
  interactiveImage,
  onRegionPress,
  onImageChange,
  routeIndex = 0,
}: InteractiveImageProps) {
  const editContext = useEditMode();
  const isEditMode = editContext?.isEditMode ?? false;
  const editingRegion = editContext?.editingRegion ?? null;

  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [containerWidth, setContainerWidth] = useState(0);

  const handleContainerLayout = useCallback((event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  }, []);

  const handleImageLoad = useCallback(() => {
    Image.getSize(
      interactiveImage.url,
      (width, height) => {
        setImageSize({ width, height });
      },
      (error) => {
        console.error('Failed to get image size:', error);
      },
    );
  }, [interactiveImage.url]);

  // Calculate display height maintaining aspect ratio
  const displayHeight =
    containerWidth && imageSize.width
      ? (containerWidth * imageSize.height) / imageSize.width
      : 0;

  // Convert relative polygon points (0-1) to absolute coordinates
  const getPolygonPoints = (region: BbucleRoadClickableRegionDto): string => {
    return region.polygon
      .map((point: BbucleRoadPolygonPointDto) => {
        const x = point.x * containerWidth;
        const y = point.y * displayHeight;
        return `${x},${y}`;
      })
      .join(' ');
  };

  // Convert editing region points to polygon string
  const getEditingPolygonPoints = (): string => {
    if (!editingRegion) return '';
    return editingRegion.points
      .map((point) => {
        const x = point.x * containerWidth;
        const y = point.y * displayHeight;
        return `${x},${y}`;
      })
      .join(' ');
  };

  const clickableRegions = interactiveImage.clickableRegions || [];

  // 현재 이 InteractiveImage가 편집 중인지 확인
  const isEditingThisImage = editingRegion?.routeIndex === routeIndex;

  // 이미지 클릭 시 점 추가 (편집 중일 때)
  const handleImageClick = useCallback(
    (event: { nativeEvent: { offsetX: number; offsetY: number } }) => {
      if (!isEditMode || !isEditingThisImage || !editContext?.addPointToRegion) {
        return;
      }

      const { offsetX, offsetY } = event.nativeEvent;
      console.log('fuckfuck 1', offsetX, offsetY, event)

      // 상대 좌표로 변환 (0-1)
      const relativeX = offsetX / containerWidth;
      const relativeY = offsetY / displayHeight;

      // 경계 체크
      if (relativeX < 0 || relativeX > 1 || relativeY < 0 || relativeY > 1) {
        return;
      }

      editContext.addPointToRegion({ x: relativeX, y: relativeY });
    },
    [isEditMode, isEditingThisImage, editContext, containerWidth, displayHeight],
  );

  // Region 클릭 핸들러
  const handleRegionClick = useCallback(
    (region: BbucleRoadClickableRegionDto, regionIndex: number) => {
      if (isEditMode && editContext?.startEditingRegion) {
        // Edit mode: 해당 region 편집 시작
        editContext.startEditingRegion(
          routeIndex,
          regionIndex,
          region.polygon,
          region.modalImageUrls || [],
        );
      } else {
        // View mode: 기존 동작
        onRegionPress(region);
      }
    },
    [isEditMode, editContext, routeIndex, onRegionPress],
  );

  const handleImageUpload = useCallback(
    (url: string) => {
      if (onImageChange) {
        onImageChange(url);
      }
    },
    [onImageChange],
  );

  // 편집 중인 점 제거
  const handleRemovePoint = useCallback(
    (pointIndex: number) => {
      if (editContext?.removePointFromRegion) {
        editContext.removePointFromRegion(pointIndex);
      }
    },
    [editContext],
  );

  // 상대 좌표를 픽셀 좌표로 변환
  const toPixelX = (x: number) => x * containerWidth;
  const toPixelY = (y: number) => y * displayHeight;

  return (
    <Container onLayout={handleContainerLayout}>
      {/* Edit Mode: 이미지 교체 버튼 */}
      {isEditMode && onImageChange && (
        <>
          <AddRegionButtonOverlay
            onPress={() => editContext?.startAddingRegion(routeIndex)}
          >
            <AddRegionButtonText>+ Region</AddRegionButtonText>
          </AddRegionButtonOverlay>
          <EditImageOverlay>
            <ImageUploader
              currentImageUrl={interactiveImage.url}
              onUploadComplete={handleImageUpload}
              compact
            />
          </EditImageOverlay>
        </>
      )}

      {/* 이미지 - 편집 중일 때는 클릭 가능 */}
      <Pressable onPress={isEditingThisImage ? handleImageClick : undefined}>
        <StyledImage
          source={{ uri: interactiveImage.url }}
          style={{ height: displayHeight || 'auto' }}
          resizeMode="contain"
          onLoad={handleImageLoad}
        />
      </Pressable>

      {/* SVG Overlay - 기존 regions + 편집 중인 region */}
      {displayHeight > 0 && (
        <SvgOverlay
          width={containerWidth}
          height={displayHeight}
          pointerEvents={isEditingThisImage ? 'none' : 'box-none'}
        >
          {/* 기존 clickable regions */}
          {clickableRegions.map((region: BbucleRoadClickableRegionDto, index: number) => {
            // 현재 편집 중인 region은 다르게 표시
            const isEditing =
              isEditingThisImage && editingRegion?.regionIndex === index;

            return (
              <Polygon
                key={region.id}
                points={getPolygonPoints(region)}
                fill={
                  isEditMode
                    ? isEditing
                      ? 'rgba(255, 165, 0, 0.3)' // 편집 모드 & 편집 중: 주황색
                      : 'rgba(0, 122, 255, 0.2)' // 편집 모드 & 일반: 파란색
                    : 'rgba(0, 0, 0, 0)' // view 모드: 투명
                }
                stroke={
                  isEditMode
                    ? isEditing
                      ? 'rgba(255, 165, 0, 0.8)'
                      : 'rgba(0, 122, 255, 0.5)'
                    : 'rgba(0, 0, 0, 0)'
                }
                strokeWidth={2}
                onPress={
                  !isEditingThisImage
                    ? () => handleRegionClick(region, index)
                    : undefined
                }
              />
            );
          })}

          {/* 편집 중인 새 region (새로 추가 중일 때) */}
          {isEditingThisImage &&
            editingRegion?.regionIndex === null &&
            editingRegion.points.length > 0 && (
              <>
                {/* Polygon 영역 (3점 이상일 때) */}
                {editingRegion.points.length >= 3 && (
                  <Polygon
                    points={getEditingPolygonPoints()}
                    fill="rgba(0, 200, 100, 0.2)"
                    stroke="rgba(0, 200, 100, 0.8)"
                    strokeWidth={2}
                  />
                )}

                {/* 점들 연결 선 */}
                {editingRegion.points.length >= 2 &&
                  editingRegion.points.map((point, index) => {
                    if (index === 0) return null;
                    const prevPoint = editingRegion.points[index - 1];
                    return (
                      <Line
                        key={`line-${index}`}
                        x1={toPixelX(prevPoint.x)}
                        y1={toPixelY(prevPoint.y)}
                        x2={toPixelX(point.x)}
                        y2={toPixelY(point.y)}
                        stroke="rgba(0, 200, 100, 0.8)"
                        strokeWidth={2}
                      />
                    );
                  })}

                {/* 마지막-첫번째 연결 선 (3점 이상일 때) */}
                {editingRegion.points.length >= 3 && (
                  <Line
                    x1={toPixelX(
                      editingRegion.points[editingRegion.points.length - 1].x,
                    )}
                    y1={toPixelY(
                      editingRegion.points[editingRegion.points.length - 1].y,
                    )}
                    x2={toPixelX(editingRegion.points[0].x)}
                    y2={toPixelY(editingRegion.points[0].y)}
                    stroke="rgba(0, 200, 100, 0.8)"
                    strokeWidth={2}
                    strokeDasharray="5,5"
                  />
                )}
              </>
            )}
        </SvgOverlay>
      )}

      {/* 편집 중인 점들 (클릭으로 제거 가능) */}
      {isEditingThisImage &&
        editingRegion &&
        displayHeight > 0 &&
        editingRegion.points.map((point, index) => (
          <PointMarker
            key={`point-${index}`}
            style={{
              left: toPixelX(point.x) - 10,
              top: toPixelY(point.y) - 10,
            }}
            onPress={() => handleRemovePoint(index)}
          >
            <PointMarkerText>{index + 1}</PointMarkerText>
          </PointMarker>
        ))}
    </Container>
  );
}

const Container = styled(View)`
  position: relative;
  width: 100%;
`;

const StyledImage = styled(Image)`
  width: 100%;
`;

const SvgOverlay = styled(Svg)`
  position: absolute;
  top: 0;
  left: 0;
`;

const EditImageOverlay = styled(View)`
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
`;

const PointMarker = styled(Pressable)`
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 10px;
  background-color: #00c864;
  align-items: center;
  justify-content: center;
  z-index: 20;
  border: 2px solid #fff;
`;

const PointMarkerText = styled(Text)`
  color: #fff;
  font-size: 10px;
  font-weight: 700;
`;

const AddRegionButtonOverlay = styled(TouchableOpacity)`
  position: absolute;
  top: 8px;
  right: 50px;
  z-index: 10;
  padding: 4px 8px;
  background-color: #007aff;
  border-radius: 4px;
`;

const AddRegionButtonText = styled(Text)`
  font-size: 11px;
  font-weight: 600;
  color: #fff;
`;
