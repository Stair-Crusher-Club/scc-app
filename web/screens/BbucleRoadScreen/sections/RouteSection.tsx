import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, useWindowDimensions } from 'react-native';
import styled from 'styled-components/native';
import type {
  BbucleRoadRouteSectionDto,
  BbucleRoadRouteDto,
  BbucleRoadClickableRegionDto,
  BbucleRoadRouteIconTypeDto,
} from '@/generated-sources/openapi';

import SccRemoteImage from '@/components/SccRemoteImage';
import InteractiveImage from '../components/InteractiveImage';
import RegionDetailModal from '../components/RegionDetailModal';
import ImageUploader from '../components/ImageUploader';
import { useEditMode } from '../context/EditModeContext';

interface RouteSectionProps {
  routeSection: BbucleRoadRouteSectionDto;
}

const ICON_MAP: Record<BbucleRoadRouteIconTypeDto, string> = {
  SUBWAY: '🚇',
  TAXI: '🚕',
  CAR: '🚗',
  BUS: '🚌',
};

const ICON_OPTIONS: BbucleRoadRouteIconTypeDto[] = ['SUBWAY', 'TAXI', 'CAR', 'BUS'];

const DESKTOP_BREAKPOINT = 900;

export default function RouteSection({ routeSection }: RouteSectionProps) {
  const editContext = useEditMode();
  const isEditMode = editContext?.isEditMode ?? false;
  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = windowWidth >= DESKTOP_BREAKPOINT;

  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [selectedRegion, setSelectedRegion] =
    useState<BbucleRoadClickableRegionDto | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const selectedRoute = routeSection.routes[selectedRouteIndex];

  const handleTabPress = useCallback((index: number) => {
    setSelectedRouteIndex(index);
  }, []);

  const handleRegionPress = useCallback(
    (region: BbucleRoadClickableRegionDto) => {
      setSelectedRegion(region);
      setIsModalVisible(true);
    },
    [],
  );

  const handleModalClose = useCallback(() => {
    setIsModalVisible(false);
    setSelectedRegion(null);
  }, []);

  // Edit mode handlers
  const updateRouteSection = useCallback(
    (updater: (prev: BbucleRoadRouteSectionDto) => BbucleRoadRouteSectionDto) => {
      if (!editContext) return;
      editContext.updateData((prev) => ({
        ...prev,
        routeSection: updater(prev.routeSection!),
      }));
    },
    [editContext],
  );

  const handleAddRoute = useCallback(() => {
    const newRoute: BbucleRoadRouteDto = {
      id: `route-${Date.now()}`,
      tabLabel: '새 동선',
      tabIconType: 'SUBWAY',
      descriptionImageUrl: '',
      interactiveImage: {
        url: '',
        clickableRegions: [],
      },
    };

    updateRouteSection((prev) => ({
      ...prev,
      routes: [...prev.routes, newRoute],
    }));

    // 새 탭으로 이동
    setSelectedRouteIndex(routeSection.routes.length);
  }, [updateRouteSection, routeSection.routes.length]);

  const handleDeleteRoute = useCallback(
    (index: number) => {
      if (routeSection.routes.length <= 1) {
        alert('최소 1개의 동선이 필요합니다.');
        return;
      }

      updateRouteSection((prev) => ({
        ...prev,
        routes: prev.routes.filter((_, i) => i !== index),
      }));

      // 선택된 탭 조정
      if (selectedRouteIndex >= routeSection.routes.length - 1) {
        setSelectedRouteIndex(Math.max(0, selectedRouteIndex - 1));
      }
    },
    [updateRouteSection, routeSection.routes.length, selectedRouteIndex],
  );

  const handleUpdateRoute = useCallback(
    (index: number, updates: Partial<BbucleRoadRouteDto>) => {
      updateRouteSection((prev) => ({
        ...prev,
        routes: prev.routes.map((route, i) =>
          i === index ? { ...route, ...updates } : route,
        ),
      }));
    },
    [updateRouteSection],
  );

  const handleDescriptionImageChange = useCallback(
    (url: string) => {
      handleUpdateRoute(selectedRouteIndex, { descriptionImageUrl: url });
    },
    [handleUpdateRoute, selectedRouteIndex],
  );

  const handleInteractiveImageChange = useCallback(
    (url: string) => {
      handleUpdateRoute(selectedRouteIndex, {
        interactiveImage: {
          ...selectedRoute.interactiveImage,
          url,
        },
      });
    },
    [handleUpdateRoute, selectedRouteIndex, selectedRoute?.interactiveImage],
  );

  // Region 변경은 이제 EditModeContext에서 처리됨

  const handleTabLabelChange = useCallback(
    (index: number, label: string) => {
      handleUpdateRoute(index, { tabLabel: label });
    },
    [handleUpdateRoute],
  );

  const handleIconTypeChange = useCallback(
    (index: number, iconType: BbucleRoadRouteIconTypeDto) => {
      handleUpdateRoute(index, { tabIconType: iconType });
    },
    [handleUpdateRoute],
  );

  return (
    <Container>
      {isEditMode
        ? <SectionTitleInput value={routeSection.title} />
        : <SectionTitle>{routeSection.title}</SectionTitle>}

      {/* Tabs */}
      <TabsContainer horizontal showsHorizontalScrollIndicator={false}>
        {routeSection.routes.map((route, index) => (
          <TabWrapper key={route.id}>
            <TabButton
              active={index === selectedRouteIndex}
              onPress={() => handleTabPress(index)}
            >
              {isEditMode ? (
                <IconSelector
                  onPress={() => {
                    const currentIndex = ICON_OPTIONS.indexOf(route.tabIconType);
                    const nextIndex = (currentIndex + 1) % ICON_OPTIONS.length;
                    handleIconTypeChange(index, ICON_OPTIONS[nextIndex]);
                  }}
                >
                  <TabIcon>{ICON_MAP[route.tabIconType]}</TabIcon>
                </IconSelector>
              ) : (
                <TabIcon>{ICON_MAP[route.tabIconType]}</TabIcon>
              )}
              {isEditMode ? (
                <TabLabelInput
                  value={route.tabLabel}
                  onChangeText={(text) => handleTabLabelChange(index, text)}
                  active={index === selectedRouteIndex}
                />
              ) : (
                <TabLabel active={index === selectedRouteIndex}>
                  {route.tabLabel}
                </TabLabel>
              )}
            </TabButton>
            {isEditMode && (
              <TabDeleteButton onPress={() => handleDeleteRoute(index)}>
                <TabDeleteButtonText>×</TabDeleteButtonText>
              </TabDeleteButton>
            )}
          </TabWrapper>
        ))}

        {/* Add Tab Button */}
        {isEditMode && (
          <AddTabButton onPress={handleAddRoute}>
            <AddTabButtonText>+</AddTabButtonText>
          </AddTabButton>
        )}
      </TabsContainer>

      {/* Content */}
      {selectedRoute && (
        <ContentContainer
          style={
            isDesktop
              ? { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center' }
              : { flexDirection: 'column-reverse' }
          }
        >
          {/* Description Image */}
          <DescriptionImageContainer style={isDesktop ? { width: '37%' } : undefined}>
            {selectedRoute.descriptionImageUrl ? (
              <DescriptionImageWrapper>
                <SccRemoteImage
                  imageUrl={selectedRoute.descriptionImageUrl}
                  resizeMode="contain"
                  style={{ borderRadius: 8 }}
                />
                {isEditMode && (
                  <DescriptionImageOverlay>
                    <ImageUploader
                      currentImageUrl={selectedRoute.descriptionImageUrl}
                      onUploadComplete={handleDescriptionImageChange}
                      compact
                    />
                  </DescriptionImageOverlay>
                )}
              </DescriptionImageWrapper>
            ) : (
              isEditMode && (
                <EmptyImagePlaceholder>
                  <EmptyImageText>설명 이미지를 업로드하세요</EmptyImageText>
                  <ImageUploader
                    onUploadComplete={handleDescriptionImageChange}
                    buttonText="이미지 업로드"
                  />
                </EmptyImagePlaceholder>
              )
            )}
          </DescriptionImageContainer>

          {/* Interactive Map Image */}
          <InteractiveImageContainer style={isDesktop ? { width: '60%' } : undefined}>
            {selectedRoute.interactiveImage.url ? (
              <InteractiveImage
                interactiveImage={selectedRoute.interactiveImage}
                onRegionPress={handleRegionPress}
                onImageChange={isEditMode ? handleInteractiveImageChange : undefined}
                routeIndex={selectedRouteIndex}
              />
            ) : (
              isEditMode && (
                <EmptyImagePlaceholder>
                  <EmptyImageText>인터랙티브 이미지를 업로드하세요</EmptyImageText>
                  <ImageUploader
                    onUploadComplete={handleInteractiveImageChange}
                    buttonText="이미지 업로드"
                  />
                </EmptyImagePlaceholder>
              )
            )}
          </InteractiveImageContainer>
        </ContentContainer>
      )}

      {/* Region Detail Modal */}
      <RegionDetailModal
        visible={isModalVisible}
        region={selectedRegion}
        onClose={handleModalClose}
      />
    </Container>
  );
}

const Container = styled(View)`
  padding: 24px 16px;
  margin-bottom: 150px;
`;

const SectionTitle = styled(Text)`
  color: #000;
  text-align: center;
  font-family: Pretendard;
  font-size: 48px;
  font-style: normal;
  font-weight: 700;
  line-height: 130%;
  letter-spacing: -2.4px;
  margin-bottom: 20px;
  word-wrap: break-word;
  overflow-wrap: break-word;
`;
const SectionTitleInput = styled(TextInput)`
  color: #000;
  text-align: center;
  font-family: Pretendard;
  font-size: 48px;
  font-style: normal;
  font-weight: 700;
  line-height: 130%;
  letter-spacing: -2.4px;
  margin-bottom: 20px;
  word-wrap: break-word;
  overflow-wrap: break-word;
`;

const TabsContainer = styled(ScrollView)`
  flex-direction: row;
  margin-bottom: 24px;
`;

const TabWrapper = styled(View)`
  flex-direction: row;
  align-items: center;
  margin-right: 8px;
`;

const TabButton = styled(TouchableOpacity)<{ active: boolean }>`
  flex-direction: row;
  align-items: center;
  padding: 12px 20px;
  border-radius: 24px;
  background-color: ${({ active }) => (active ? '#007AFF' : '#F3F4F6')};
`;

const IconSelector = styled(TouchableOpacity)`
  margin-right: 8px;
`;

const TabIcon = styled(Text)`
  font-size: 18px;
  margin-right: 8px;
`;

const TabLabel = styled(Text)<{ active: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${({ active }) => (active ? '#FFF' : '#374151')};
`;

const TabLabelInput = styled(TextInput)<{ active: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${({ active }) => (active ? '#FFF' : '#374151')};
  padding: 0;
`;

const TabDeleteButton = styled(TouchableOpacity)`
  width: 20px;
  height: 20px;
  border-radius: 10px;
  background-color: #dc3545;
  align-items: center;
  justify-content: center;
  margin-left: -8px;
  margin-top: -12px;
`;

const TabDeleteButtonText = styled(Text)`
  color: #fff;
  font-size: 14px;
  font-weight: 700;
`;

const AddTabButton = styled(TouchableOpacity)`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: #e0e0e0;
  align-items: center;
  justify-content: center;
`;

const AddTabButtonText = styled(Text)`
  font-size: 24px;
  color: #666;
`;

const ContentContainer = styled(View)`
  gap: 30px;
`;

const DescriptionImageContainer = styled(View)`
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
`;

const DescriptionImageWrapper = styled(View)`
  position: relative;
`;

const DescriptionImageOverlay = styled(View)`
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
`;

const InteractiveImageContainer = styled(View)`
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
`;

const EmptyImagePlaceholder = styled(View)`
  padding: 40px;
  background-color: #f8f9fa;
  border: 2px dashed #ddd;
  border-radius: 8px;
  align-items: center;
  gap: 16px;
`;

const EmptyImageText = styled(Text)`
  font-size: 14px;
  color: #666;
`;
