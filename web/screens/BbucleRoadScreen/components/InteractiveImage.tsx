import React, { useState, useCallback } from 'react';
import { View, Image, TouchableOpacity, Text, LayoutChangeEvent } from 'react-native';
import styled from 'styled-components/native';
import Svg, { Polygon } from 'react-native-svg';
import type {
  BbucleRoadInteractiveImageDto,
  BbucleRoadClickableRegionDto,
  BbucleRoadPolygonPointDto,
} from '@/generated-sources/openapi';

import { useEditMode } from '../context/EditModeContext';
import PolygonEditor from './PolygonEditor';
import ImageUploader from './ImageUploader';

interface InteractiveImageProps {
  interactiveImage: BbucleRoadInteractiveImageDto;
  onRegionPress: (region: BbucleRoadClickableRegionDto) => void;
  /** 이미지 URL 변경 콜백 (edit mode) */
  onImageChange?: (url: string) => void;
  /** Region 변경 콜백 (edit mode) */
  onRegionsChange?: (regions: BbucleRoadClickableRegionDto[]) => void;
}

export default function InteractiveImage({
  interactiveImage,
  onRegionPress,
  onImageChange,
  onRegionsChange,
}: InteractiveImageProps) {
  const editContext = useEditMode();
  const isEditMode = editContext?.isEditMode ?? false;

  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [containerWidth, setContainerWidth] = useState(0);
  const [isAddingRegion, setIsAddingRegion] = useState(false);
  const [editingRegionIndex, setEditingRegionIndex] = useState<number | null>(null);

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
      .map((point) => {
        const x = point.x * containerWidth;
        const y = point.y * displayHeight;
        return `${x},${y}`;
      })
      .join(' ');
  };

  const clickableRegions = interactiveImage.clickableRegions || [];

  // Edit mode handlers
  const handleAddRegion = useCallback(() => {
    setIsAddingRegion(true);
    setEditingRegionIndex(null);
  }, []);

  const handleEditRegion = useCallback((index: number) => {
    setEditingRegionIndex(index);
    setIsAddingRegion(false);
  }, []);

  const handleDeleteRegion = useCallback(
    (index: number) => {
      if (!onRegionsChange) return;
      const newRegions = clickableRegions.filter((_, i) => i !== index);
      onRegionsChange(newRegions);
    },
    [clickableRegions, onRegionsChange],
  );

  const handlePolygonComplete = useCallback(
    (points: BbucleRoadPolygonPointDto[]) => {
      if (!onRegionsChange) return;

      if (editingRegionIndex !== null) {
        // 기존 region 수정
        const newRegions = clickableRegions.map((region, index) =>
          index === editingRegionIndex ? { ...region, polygon: points } : region,
        );
        onRegionsChange(newRegions);
      } else {
        // 새 region 추가
        const newRegion: BbucleRoadClickableRegionDto = {
          id: `region-${Date.now()}`,
          polygon: points,
          modalImageUrls: [],
        };
        onRegionsChange([...clickableRegions, newRegion]);
      }

      setIsAddingRegion(false);
      setEditingRegionIndex(null);
    },
    [clickableRegions, editingRegionIndex, onRegionsChange],
  );

  const handlePolygonCancel = useCallback(() => {
    setIsAddingRegion(false);
    setEditingRegionIndex(null);
  }, []);

  const handleImageUpload = useCallback(
    (url: string) => {
      if (onImageChange) {
        onImageChange(url);
      }
    },
    [onImageChange],
  );

  // Polygon Editor 표시 조건
  const showPolygonEditor = isAddingRegion || editingRegionIndex !== null;
  const editingPoints =
    editingRegionIndex !== null
      ? clickableRegions[editingRegionIndex]?.polygon
      : undefined;

  if (showPolygonEditor) {
    return (
      <PolygonEditor
        imageUrl={interactiveImage.url}
        onComplete={handlePolygonComplete}
        onCancel={handlePolygonCancel}
        initialPoints={editingPoints}
      />
    );
  }

  return (
    <Container onLayout={handleContainerLayout}>
      {/* Edit Mode: 이미지 교체 버튼 */}
      {isEditMode && onImageChange && (
        <EditImageOverlay>
          <ImageUploader
            currentImageUrl={interactiveImage.url}
            onUploadComplete={handleImageUpload}
            compact
          />
        </EditImageOverlay>
      )}

      <StyledImage
        source={{ uri: interactiveImage.url }}
        style={{ height: displayHeight || 'auto' }}
        resizeMode="contain"
        onLoad={handleImageLoad}
      />

      {displayHeight > 0 && clickableRegions.length > 0 && (
        <SvgOverlay width={containerWidth} height={displayHeight}>
          {clickableRegions.map((region, index) => (
            <Polygon
              key={region.id}
              points={getPolygonPoints(region)}
              fill="rgba(0, 122, 255, 0.2)"
              stroke="rgba(0, 122, 255, 0.5)"
              strokeWidth={2}
              onPress={() => {
                if (isEditMode) {
                  handleEditRegion(index);
                } else {
                  onRegionPress(region);
                }
              }}
            />
          ))}
        </SvgOverlay>
      )}

      {/* Edit Mode: Region 삭제 버튼들 */}
      {isEditMode && displayHeight > 0 && clickableRegions.length > 0 && (
        <>
          {clickableRegions.map((region, index) => {
            // 중심점 계산
            const centerX =
              region.polygon.reduce((sum, p) => sum + p.x, 0) /
              region.polygon.length;
            const centerY =
              region.polygon.reduce((sum, p) => sum + p.y, 0) /
              region.polygon.length;

            return (
              <RegionDeleteButton
                key={`delete-${region.id}`}
                style={{
                  left: centerX * containerWidth - 12,
                  top: centerY * displayHeight - 12,
                }}
                onPress={() => handleDeleteRegion(index)}
              >
                <RegionDeleteButtonText>×</RegionDeleteButtonText>
              </RegionDeleteButton>
            );
          })}
        </>
      )}

      {/* Edit Mode: Region 추가 버튼 */}
      {isEditMode && onRegionsChange && (
        <AddRegionButton onPress={handleAddRegion}>
          <AddRegionButtonText>+ Region 추가</AddRegionButtonText>
        </AddRegionButton>
      )}
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

const RegionDeleteButton = styled(TouchableOpacity)`
  position: absolute;
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background-color: #dc3545;
  align-items: center;
  justify-content: center;
  z-index: 10;
`;

const RegionDeleteButtonText = styled(Text)`
  color: #fff;
  font-size: 16px;
  font-weight: 700;
`;

const AddRegionButton = styled(TouchableOpacity)`
  margin-top: 12px;
  padding: 12px;
  background-color: #007aff;
  border-radius: 8px;
  align-items: center;
`;

const AddRegionButtonText = styled(Text)`
  color: #fff;
  font-size: 14px;
  font-weight: 600;
`;
